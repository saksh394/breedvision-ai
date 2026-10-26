"""
models.py
---------
SQLAlchemy ORM models for the three database tables:

  users       — registered accounts (farmer / FLW / admin)
  predictions — one row per /predict call
  corrections — FLW corrections on a prediction
"""

import datetime
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


# ---------------------------------------------------------------------------
# users
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role       = Column(String(10), nullable=False)   # "user" | "flw" | "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # relationships
    predictions = relationship("Prediction", back_populates="user",
                               foreign_keys="Prediction.user_id")
    corrections = relationship("Correction", back_populates="corrected_by",
                               foreign_keys="Correction.corrected_by_user_id")

    def __repr__(self):
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"


# ---------------------------------------------------------------------------
# predictions
# ---------------------------------------------------------------------------

class Prediction(Base):
    __tablename__ = "predictions"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    image_filename   = Column(String(255), nullable=True)
    predicted_breed  = Column(String(120), nullable=False)
    confidence       = Column(Float, nullable=False)
    # top3_predictions stored as a JSON string, e.g.:
    # '[{"breed": "Gir", "confidence": 78}, ...]'
    top3_predictions = Column(Text, nullable=True)
    animal_type      = Column(String(60), nullable=True)
    breed_status     = Column(String(60), nullable=True)
    # "local_model" (ResNet18 was confident enough) or "grok_fallback"
    # (ResNet18 confidence was below threshold, xAI's Grok was used instead)
    source           = Column(String(20), nullable=False, default="local_model")
    # Only populated when source == "grok_fallback" — preserves what the
    # local model originally guessed, for transparency/audit purposes.
    local_model_breed      = Column(String(120), nullable=True)
    local_model_confidence = Column(Float, nullable=True)
    created_at       = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # relationships
    user        = relationship("User", back_populates="predictions",
                               foreign_keys=[user_id])
    corrections = relationship("Correction", back_populates="prediction")

    def __repr__(self):
        return (
            f"<Prediction id={self.id} breed={self.predicted_breed!r} "
            f"confidence={self.confidence}>"
        )


# ---------------------------------------------------------------------------
# corrections
# ---------------------------------------------------------------------------

class Correction(Base):
    __tablename__ = "corrections"

    id                    = Column(Integer, primary_key=True, index=True)
    prediction_id         = Column(Integer, ForeignKey("predictions.id"),
                                   nullable=False, index=True)
    corrected_by_user_id  = Column(Integer, ForeignKey("users.id"),
                                   nullable=True, index=True)
    original_breed        = Column(String(120), nullable=False)
    corrected_breed       = Column(String(120), nullable=False)
    notes                 = Column(Text, nullable=True)
    created_at            = Column(DateTime, default=datetime.datetime.utcnow,
                                   nullable=False)

    # relationships
    prediction   = relationship("Prediction", back_populates="corrections")
    corrected_by = relationship("User", back_populates="corrections",
                                foreign_keys=[corrected_by_user_id])

    def __repr__(self):
        return (
            f"<Correction id={self.id} prediction_id={self.prediction_id} "
            f"{self.original_breed!r} → {self.corrected_breed!r}>"
        )
