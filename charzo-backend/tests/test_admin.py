"""Tests for admin dashboard + security hardening — Tasks 13 & 14."""
import pytest
from sqlmodel import select

CUSTOMER = {"email": "cust@charzo.in", "full_name": "Customer", "phone": "+919211968184", "password": "pass1234"}
VEHICLE = {"make": "Tata", "model": "Nexon EV", "year": 2023, "connector_type": "CCS"}
LOCATION = {"latitude": 28.6139, "longitude": 77.2090, "address": "Delhi"}


async def make_admin_token(client, db_session):
    """Register a user then promote to admin directly in DB."""
    from app.models.user import User
    payload = {"email": "admin@charzo.in", "full_name": "Admin", "phone": "+919211968100", "password": "admin1234"}
    await client.post("/auth/register", json=payload)
    # Promote to admin in test DB
    from sqlmodel import select
    result = await db_session.exec(select(User).where(User.email == "admin@charzo.in"))
    user = result.first()
    user.role = "admin"
    db_session.add(user)
    await db_session.commit()
    r = await client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]})
    return r.json()["access_token"]


async def make_customer_token(client):
    await client.post("/auth/register", json=CUSTOMER)
    r = await client.post("/auth/login", json={"email": CUSTOMER["email"], "password": CUSTOMER["password"]})
    return r.json()["access_token"]


# ── Non-admin access blocked ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_customer_cannot_access_admin_dashboard(client):
    token = await make_customer_token(client)
    resp = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_cannot_access_admin(client):
    resp = await client.get("/admin/dashboard")
    assert resp.status_code == 401


# ── Dashboard stats ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_dashboard_returns_stats(client, db_session):
    token = await make_admin_token(client, db_session)
    resp = await client.get("/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "total_vehicles" in data
    assert "requests_by_status" in data
    assert "requests_last_7_days" in data
    assert "requests_last_30_days" in data


# ── User management ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_list_users(client, db_session):
    token = await make_admin_token(client, db_session)
    await client.post("/auth/register", json=CUSTOMER)
    resp = await client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_admin_search_users(client, db_session):
    token = await make_admin_token(client, db_session)
    await client.post("/auth/register", json=CUSTOMER)
    resp = await client.get("/admin/users?search=cust", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    results = resp.json()
    assert any("cust" in u["email"] for u in results)


@pytest.mark.asyncio
async def test_admin_deactivate_user(client, db_session):
    token = await make_admin_token(client, db_session)
    cust_token = await make_customer_token(client)
    # Get customer ID
    profile = (await client.get("/users/me", headers={"Authorization": f"Bearer {cust_token}"})).json()
    user_id = profile["id"]
    resp = await client.patch(
        f"/admin/users/{user_id}/status?status=inactive",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "inactive"


@pytest.mark.asyncio
async def test_admin_update_nonexistent_user_returns_404(client, db_session):
    token = await make_admin_token(client, db_session)
    fake_id = "00000000-0000-0000-0000-000000000001"
    resp = await client.patch(
        f"/admin/users/{fake_id}/status?status=inactive",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 404


# ── Request management ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_list_all_requests(client, db_session):
    token = await make_admin_token(client, db_session)
    # Create a request as customer
    cust_token = await make_customer_token(client)
    v = (await client.post("/vehicles", json=VEHICLE, headers={"Authorization": f"Bearer {cust_token}"})).json()
    await client.post("/requests", json={**LOCATION, "vehicle_id": v["id"]},
        headers={"Authorization": f"Bearer {cust_token}"})
    resp = await client.get("/admin/requests", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_admin_filter_requests_by_status(client, db_session):
    token = await make_admin_token(client, db_session)
    resp = await client.get("/admin/requests?status=pending", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    for r in resp.json():
        assert r["status"] == "pending"


# ── Security: CORS origin header present ─────────────────────────────────────

@pytest.mark.asyncio
async def test_cors_header_present_on_response(client):
    resp = await client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert resp.status_code == 200
    # CORS headers should be present for allowed origin
    assert "access-control-allow-origin" in resp.headers


@pytest.mark.asyncio
async def test_x_request_id_on_all_responses(client):
    resp = await client.get("/health")
    assert "x-request-id" in resp.headers
