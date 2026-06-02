"""Unit tests for core security utilities — Task 3."""
import time
from uuid import uuid4

import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


# ── Password hashing ──────────────────────────────────────────────────────────

def test_hash_password_returns_bcrypt_string():
    hashed = hash_password("securepass123")
    assert hashed.startswith("$2b$")


def test_verify_password_correct():
    plain = "mypassword99"
    hashed = hash_password(plain)
    assert verify_password(plain, hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correct")
    assert verify_password("wrong", hashed) is False


def test_hash_password_never_stores_plaintext():
    plain = "plaintext!"
    hashed = hash_password(plain)
    assert plain not in hashed


def test_same_password_produces_different_hashes():
    h1 = hash_password("samepassword")
    h2 = hash_password("samepassword")
    # bcrypt salts ensure different hashes each time
    assert h1 != h2


# ── Access token ──────────────────────────────────────────────────────────────

def test_create_and_decode_access_token():
    user_id = str(uuid4())
    token = create_access_token(user_id=user_id, role="customer")
    payload = decode_access_token(token)
    assert payload["sub"] == user_id
    assert payload["role"] == "customer"


def test_access_token_has_exp_and_iat():
    token = create_access_token(user_id=str(uuid4()), role="admin")
    payload = decode_access_token(token)
    assert "exp" in payload
    assert "iat" in payload
    assert payload["exp"] > payload["iat"]


def test_decode_invalid_token_raises():
    with pytest.raises(ValueError):
        decode_access_token("not.a.valid.token")


def test_decode_wrong_key_raises():
    """Token signed with wrong key should fail validation."""
    from jose import jwt as jose_jwt
    fake_token = jose_jwt.encode(
        {"sub": "abc", "role": "customer", "exp": int(time.time()) + 900},
        "wrong-secret",
        algorithm="HS256",
    )
    with pytest.raises(ValueError):
        decode_access_token(fake_token)


def test_decode_expired_token_raises():
    """Token with past expiry should raise ValueError."""
    from jose import jwt as jose_jwt
    from app.config import settings
    expired_token = jose_jwt.encode(
        {"sub": str(uuid4()), "role": "customer", "exp": int(time.time()) - 10},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    with pytest.raises(ValueError):
        decode_access_token(expired_token)


def test_token_payload_contains_only_safe_fields():
    """Ensure no sensitive data (password etc.) leaks into token."""
    token = create_access_token(user_id=str(uuid4()), role="customer")
    payload = decode_access_token(token)
    sensitive_keys = {"password", "password_hash", "email", "phone"}
    assert not sensitive_keys.intersection(payload.keys())


# ── Refresh token ─────────────────────────────────────────────────────────────

def test_create_refresh_token_returns_tuple():
    raw, token_hash = create_refresh_token()
    assert isinstance(raw, str)
    assert isinstance(token_hash, str)


def test_refresh_token_raw_and_hash_differ():
    raw, token_hash = create_refresh_token()
    assert raw != token_hash


def test_refresh_token_hash_is_deterministic():
    raw, token_hash = create_refresh_token()
    assert hash_refresh_token(raw) == token_hash


def test_two_refresh_tokens_are_unique():
    raw1, _ = create_refresh_token()
    raw2, _ = create_refresh_token()
    assert raw1 != raw2


def test_refresh_token_raw_not_stored_in_hash():
    raw, token_hash = create_refresh_token()
    assert raw not in token_hash
