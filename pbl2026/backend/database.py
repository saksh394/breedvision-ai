"""
database.py
-----------
Initialises the Supabase Python client (supabase-py) using the
service-role key so the backend can read and write every table
without being blocked by Row Level Security policies.

Usage in a route:
    from database import get_supabase
    from fastapi import Depends
    from supabase import Client

    @app.post("/example")
    def example(sb: Client = Depends(get_supabase)):
        result = sb.table("analyses").select("*").execute()
        ...

The client is created once at module import time (singleton) and
re-used across all requests — supabase-py is thread-safe for reads
and uses httpx under the hood.
"""

import os
from functools import lru_cache

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise EnvironmentError(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env"
    )


@lru_cache(maxsize=1)
def _get_client() -> Client:
    """Return the singleton Supabase client (created once, cached forever)."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_supabase() -> Client:
    """
    FastAPI dependency that yields the shared Supabase client.

    Because the client is stateless (all auth context is sent per-request
    via headers), sharing a single instance across requests is safe.
    """
    return _get_client()
