"""Integration tests for login, refresh, logout — Task 5."""
import pytest

REGISTER_PAYLOAD = {
    "email": "auth@charzo.in",
    "full_name": "Auth User",
    "phone": "+919211968184",
    "password": "secure123",
}


async def register_and_login(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    })
    return resp.json()


# ── Login ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_valid_returns_200_with_tokens(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": "wrongpassword",
    })
    assert resp.status_code == 401
    # Generic message — must not reveal which field was wrong
    assert "Invalid credentials" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_login_unknown_email_returns_401(client):
    resp = await client.post("/auth/login", json={
        "email": "nobody@charzo.in",
        "password": "anypassword",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_error_message_is_generic(client):
    """Must not reveal whether email or password was wrong."""
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp_bad_pass = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"], "password": "wrong"
    })
    resp_bad_email = await client.post("/auth/login", json={
        "email": "noone@charzo.in", "password": "wrong"
    })
    assert resp_bad_pass.json()["detail"] == resp_bad_email.json()["detail"]


# ── Refresh ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_refresh_valid_returns_new_tokens(client):
    tokens = await register_and_login(client)
    resp = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 200
    new_tokens = resp.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    # Refresh token must always be new (single-use rotation)
    assert new_tokens["refresh_token"] != tokens["refresh_token"]


@pytest.mark.asyncio
async def test_refresh_old_token_revoked_after_rotation(client):
    tokens = await register_and_login(client)
    # Use token once
    await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    # Second use of same token must fail
    resp = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_invalid_token_returns_401(client):
    resp = await client.post("/auth/refresh", json={"refresh_token": "invalid-token-xyz"})
    assert resp.status_code == 401


# ── Logout ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_logout_returns_200(client):
    tokens = await register_and_login(client)
    resp = await client.post(
        "/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(client):
    tokens = await register_and_login(client)
    await client.post(
        "/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    # After logout, refresh token should be invalid
    resp = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_logout_without_token_returns_401(client):
    resp = await client.post("/auth/logout", json={"refresh_token": "any"})
    assert resp.status_code == 401
