"""Tests for user profile + vehicle management — Tasks 9 & 10."""
import pytest

USER_A = {"email": "usera@charzo.in", "full_name": "User A", "phone": "+919211968181", "password": "pass1234"}
USER_B = {"email": "userb@charzo.in", "full_name": "User B", "phone": "+919211968182", "password": "pass1234"}
VEHICLE = {"make": "Tata", "model": "Nexon EV", "year": 2023, "connector_type": "CCS"}


async def register_login(client, payload):
    await client.post("/auth/register", json=payload)
    r = await client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]})
    return r.json()["access_token"]


# ── Profile ───────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_profile_returns_user_data(client):
    token = await register_login(client, USER_A)
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == USER_A["email"]
    assert data["role"] == "customer"
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_patch_profile_updates_name(client):
    token = await register_login(client, USER_A)
    resp = await client.patch("/users/me",
        json={"full_name": "Updated Name"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Name"


@pytest.mark.asyncio
async def test_patch_profile_invalid_phone_returns_422(client):
    token = await register_login(client, USER_A)
    resp = await client.patch("/users/me",
        json={"phone": "not-a-phone"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_change_password_correct_current(client):
    token = await register_login(client, USER_A)
    resp = await client.post("/users/me/change-password",
        json={"current_password": USER_A["password"], "new_password": "newpass999"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    # Old password should no longer work
    login_resp = await client.post("/auth/login", json={
        "email": USER_A["email"], "password": USER_A["password"]
    })
    assert login_resp.status_code == 401


@pytest.mark.asyncio
async def test_change_password_wrong_current_returns_401(client):
    token = await register_login(client, USER_A)
    resp = await client.post("/users/me/change-password",
        json={"current_password": "wrongpassword", "new_password": "newpass999"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_cannot_modify_own_role(client):
    token = await register_login(client, USER_A)
    resp = await client.patch("/users/me",
        json={"role": "admin"},
        headers={"Authorization": f"Bearer {token}"}
    )
    # Role field is not in UpdateProfileRequest so it's ignored — role stays customer
    profile = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert profile.json()["role"] == "customer"


# ── Vehicles ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_vehicle_returns_201(client):
    token = await register_login(client, USER_A)
    resp = await client.post("/vehicles", json=VEHICLE,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["make"] == "Tata"
    assert data["connector_type"] == "CCS"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_vehicles_empty(client):
    token = await register_login(client, USER_A)
    resp = await client.get("/vehicles", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_vehicles_returns_own_only(client):
    token_a = await register_login(client, USER_A)
    token_b = await register_login(client, USER_B)
    await client.post("/vehicles", json=VEHICLE, headers={"Authorization": f"Bearer {token_a}"})
    resp = await client.get("/vehicles", headers={"Authorization": f"Bearer {token_b}"})
    assert resp.json() == []


@pytest.mark.asyncio
async def test_invalid_connector_type_returns_422(client):
    token = await register_login(client, USER_A)
    resp = await client.post("/vehicles",
        json={**VEHICLE, "connector_type": "USB"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_invalid_year_returns_422(client):
    token = await register_login(client, USER_A)
    resp = await client.post("/vehicles",
        json={**VEHICLE, "year": 1985},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_update_own_vehicle(client):
    token = await register_login(client, USER_A)
    v = (await client.post("/vehicles", json=VEHICLE, headers={"Authorization": f"Bearer {token}"})).json()
    resp = await client.patch(f"/vehicles/{v['id']}",
        json={"make": "MG"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["make"] == "MG"


@pytest.mark.asyncio
async def test_update_other_user_vehicle_returns_403(client):
    token_a = await register_login(client, USER_A)
    token_b = await register_login(client, USER_B)
    v = (await client.post("/vehicles", json=VEHICLE, headers={"Authorization": f"Bearer {token_a}"})).json()
    resp = await client.patch(f"/vehicles/{v['id']}",
        json={"make": "Hacked"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_own_vehicle(client):
    token = await register_login(client, USER_A)
    v = (await client.post("/vehicles", json=VEHICLE, headers={"Authorization": f"Bearer {token}"})).json()
    resp = await client.delete(f"/vehicles/{v['id']}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    # Should not appear in list anymore
    vehicles = (await client.get("/vehicles", headers={"Authorization": f"Bearer {token}"})).json()
    assert all(x["id"] != v["id"] for x in vehicles)


@pytest.mark.asyncio
async def test_delete_other_user_vehicle_returns_403(client):
    token_a = await register_login(client, USER_A)
    token_b = await register_login(client, USER_B)
    v = (await client.post("/vehicles", json=VEHICLE, headers={"Authorization": f"Bearer {token_a}"})).json()
    resp = await client.delete(f"/vehicles/{v['id']}", headers={"Authorization": f"Bearer {token_b}"})
    assert resp.status_code == 403
