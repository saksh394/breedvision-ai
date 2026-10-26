"""
auth.py
-------
Authentication utilities for the BreedVision FastAPI backend using
Supabase Auth.

How it works
============
1. The frontend calls supabase.auth.signInWithPassword() directly.
   Supabase returns a JWT (access_token) signed with the project's
   JWT secret.

2. Every protected API request includes the header:
       Authorization: Bearer <supabase_access_token>

3. The backend verifies the JWT locally using PyJWT + the Supabase
   JWT secret (SUPABASE_JWT_SECRET in .env).  No network round-trip
   to Supabase is needed for each request.

4. After verifying the token we fetch the matching row from the
   `profiles` table to get the user's name, role, and status.

Pydantic schemas for request/response bodies are kept here so
main.py stays clean.
"""

import base64
import os
from typing import Optional

import jwt as pyjwt                        # PyJWT
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, field_validator
from supabase import Client

from database import get_supabase

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

# Found in Supabase Dashboard → Project → Settings → API → JWT Settings
SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
JWT_ALGORITHM: str = "HS256"

# Supabase JWT secrets are base64url-encoded 64-byte keys.
# PyJWT requires the raw bytes — decode once at startup.
def _resolve_jwt_secret(secret_str: str) -> bytes:
    """Return the raw signing bytes from the Supabase JWT secret string."""
    if not secret_str:
        return b""
    try:
        # base64url decode (Supabase standard — 88 chars → 64 bytes)
        padding = 4 - len(secret_str) % 4
        return base64.urlsafe_b64decode(secret_str + ("=" * (padding % 4)))
    except Exception:
        # Fallback: use the string as-is encoded to UTF-8
        return secret_str.encode("utf-8")

JWT_SECRET_BYTES: bytes = _resolve_jwt_secret(SUPABASE_JWT_SECRET)

print(f"[Auth] JWT secret configured: {bool(SUPABASE_JWT_SECRET)} (length: {len(SUPABASE_JWT_SECRET)}, raw bytes: {len(JWT_SECRET_BYTES)})")

VALID_ROLES = {"user", "flw", "admin"}

# ---------------------------------------------------------------------------
# OAuth2 scheme  (reads Authorization: Bearer <token>)
# ---------------------------------------------------------------------------

oauth2_scheme          = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# ---------------------------------------------------------------------------
# JWT verification
# ---------------------------------------------------------------------------

def _verify_supabase_token(token: str) -> dict:
    if not JWT_SECRET_BYTES:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_JWT_SECRET is not configured on the server.",
        )
    try:
        payload = pyjwt.decode(
            token,
            JWT_SECRET_BYTES,
            algorithms=[JWT_ALGORITHM],
            audience="authenticated",
        )
        return payload
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except pyjwt.PyJWTError as e:
        print(f"[Auth] JWT decode failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ---------------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    sb: Client = Depends(get_supabase),
) -> dict:
    """
    Strict dependency — raises HTTP 401 if no valid Supabase JWT is supplied.
    Returns the profile row dict (id, name, email, role, status, …).
    """
    payload = _verify_supabase_token(token)
    user_id: Optional[str] = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is malformed (missing sub).",
        )

    result = sb.table("profiles").select("*").eq("id", user_id).single().execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )

    profile = result.data
    if profile.get("status") in ("Inactive", "Deactivated"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    return profile


def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    sb: Client = Depends(get_supabase),
) -> Optional[dict]:
    """
    Optional auth dependency — used for /predict so unauthenticated calls
    still work.  Decodes the JWT locally (no DB round-trip) to extract
    user_id and name from the token payload.
    """
    if not token or not JWT_SECRET_BYTES:
        return None

    for verify_aud in (True, False):
        try:
            if verify_aud:
                payload = pyjwt.decode(
                    token,
                    JWT_SECRET_BYTES,
                    algorithms=[JWT_ALGORITHM],
                    audience="authenticated",
                )
            else:
                payload = pyjwt.decode(
                    token,
                    JWT_SECRET_BYTES,
                    algorithms=[JWT_ALGORITHM],
                    options={"verify_aud": False},
                )
            user_id = payload.get("sub")
            if not user_id:
                return None
            meta = payload.get("user_metadata") or {}
            name = meta.get("name") or meta.get("full_name") or payload.get("email", "")
            print(f"[Auth] ✅ optional user from JWT: id={user_id} name={name!r}")
            return {"id": user_id, "name": name}
        except pyjwt.ExpiredSignatureError:
            print("[Auth] optional user: token expired")
            return None
        except pyjwt.PyJWTError:
            continue

    print("[Auth] optional user: JWT decode failed")
    return None


def require_role(*roles: str):
    """
    Dependency factory — raises HTTP 403 if the user's role is not in *roles*.

    Usage:
        @app.delete("/admin/user/{id}")
        def delete_user(user=Depends(require_role("admin"))):
            ...
    """
    def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of these roles: {', '.join(roles)}",
            )
        return user
    return _check


# ---------------------------------------------------------------------------
# Pydantic schemas  (kept for any endpoints that still need request bodies)
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    role:     str = "user"

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"role must be one of {sorted(VALID_ROLES)}")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("password must be at least 6 characters")
        return v


class RegisterResponse(BaseModel):
    id:      str
    name:    str
    email:   str
    role:    str
    message: str = "Account created successfully."


class LoginResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      str
    name:         str
    email:        str
    role:         str
