"""Tests for JWT auth dependency and RBAC — Task 7."""
import pytest

CUSTOMER_PAYLOAD = {
    "email": "customer@charzo.in",
    "full_name": "Test Customer",
    "phone": "+919211968184",
    "password": "secure123",
}


async def get_customer_token(client) -> str:
    await client.post("/auth/register", json=CUSTOMER_PAYLOAD)
    resp = await client.post("/auth/login", json={
        "email": CUSTOMER_PAYLOAD["email"],
        "password": CUSTOMER_PAYLOAD["password"],
    })
    return resp.json()["access_token"]


# ── Missing token ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_protected_endpoint_no_token_returns_401(client):
    resp = await client.get("/users/me")
    assert resp.status_code == 401


# ── Invalid / expired token ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_invalid_token_returns_401(client):
    resp = await client.get("/users/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_malformed_bearer_returns_401(client):
    resp = await client.get("/users/me", headers={"Authorization": "NotBearer abc"})
    assert resp.status_code == 401


# ── Valid token ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_valid_token_allows_access(client):
    token = await get_customer_token(client)
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200


# ── RBAC — admin endpoint blocked for customer ───────────────────────────────

@pytest.mark.asyncio
async def test_customer_cannot_access_admin_endpoint(client):
    token = await get_customer_token(client)
    resp = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_cannot_access_admin_endpoint(client):
    resp = await client.get("/admin/dashboard")
    assert resp.status_code == 401


# ── X-Request-ID present on all responses ────────────────────────────────────

@pytest.mark.asyncio
async def test_x_request_id_on_protected_response(client):
    token = await get_customer_token(client)
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert "x-request-id" in resp.headers


@pytest.mark.asyncio
async def test_x_request_id_on_error_response(client):
    resp = await client.get("/users/me")
    assert "x-request-id" in resp.headers
