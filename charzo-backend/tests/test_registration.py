"""Integration tests for POST /auth/register — Task 4."""
import pytest

VALID_PAYLOAD = {
    "email": "test@charzo.in",
    "full_name": "Vaibhav Gawai",
    "phone": "+919211968184",
    "password": "secure123",
}


@pytest.mark.asyncio
async def test_register_valid_returns_201(client):
    resp = await client.post("/auth/register", json=VALID_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "test@charzo.in"
    assert data["role"] == "customer"
    assert data["status"] == "active"
    assert "id" in data
    # password must never appear in response
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_409(client):
    await client.post("/auth/register", json=VALID_PAYLOAD)
    resp = await client.post("/auth/register", json=VALID_PAYLOAD)
    assert resp.status_code == 409
    assert "email" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_short_password_returns_422(client):
    payload = {**VALID_PAYLOAD, "password": "short"}
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email_returns_422(client):
    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_missing_field_returns_422(client):
    payload = {"email": "test2@charzo.in", "password": "secure123"}
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_sets_role_customer(client):
    resp = await client.post("/auth/register", json=VALID_PAYLOAD)
    assert resp.json()["role"] == "customer"


@pytest.mark.asyncio
async def test_register_sets_status_active(client):
    resp = await client.post("/auth/register", json=VALID_PAYLOAD)
    assert resp.json()["status"] == "active"


@pytest.mark.asyncio
async def test_register_response_has_created_at(client):
    resp = await client.post("/auth/register", json=VALID_PAYLOAD)
    assert "created_at" in resp.json()
