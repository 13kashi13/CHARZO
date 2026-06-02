import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config import settings

# ── Password hashing ──────────────────────────────────────────────────────────
_BCRYPT_ROUNDS = 12


def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt (cost=12)."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── Access token ──────────────────────────────────────────────────────────────

def create_access_token(user_id: str, role: str) -> str:
    """
    Create a signed HS256 JWT access token.
    Payload: sub (user_id), role, iat, exp.
    Expiry: ACCESS_TOKEN_EXPIRE_MINUTES from config.
    """
    now = datetime.now(tz=timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises ValueError on invalid signature, expiry, or malformed token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


# ── Refresh token ─────────────────────────────────────────────────────────────

def create_refresh_token() -> tuple[str, str]:
    """
    Generate a cryptographically secure refresh token.
    Returns (raw_token, sha256_hash).
    - raw_token: sent to the client, never stored
    - sha256_hash: stored in the DB
    """
    raw = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, token_hash


def hash_refresh_token(raw: str) -> str:
    """Hash a raw refresh token for DB lookup."""
    return hashlib.sha256(raw.encode()).hexdigest()
