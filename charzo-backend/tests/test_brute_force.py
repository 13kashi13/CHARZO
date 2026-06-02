"""Integration tests for brute force protection — Task 6."""
import pytest

REGISTER_PAYLOAD = {
    "email": "brute@charzo.in",
    "full_name": "Brute Test",
    "phone": "+919211968184",
    "password": "correct123",
}


@pytest.mark.asyncio
async def test_five_failures_then_lockout(client):
    """After 5 failures, 6th attempt returns 429 even with correct password."""
    await client.post("/auth/register", json=REGISTER_PAYLOAD)

    bad = {"email": REGISTER_PAYLOAD["email"], "password": "wrongpassword"}

    for i in range(5):
        resp = await client.post("/auth/login", json=bad)
        assert resp.status_code == 401, f"Attempt {i+1} should be 401"

    # 6th attempt — locked out, even with correct password
    resp = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    })
    assert resp.status_code == 429


@pytest.mark.asyncio
async def test_four_failures_not_locked(client):
    """4 failures should not trigger lockout."""
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    bad = {"email": REGISTER_PAYLOAD["email"], "password": "wrong"}

    for _ in range(4):
        await client.post("/auth/login", json=bad)

    # 5th attempt with correct password should succeed
    resp = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    })
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_lockout_returns_429_status(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    bad = {"email": REGISTER_PAYLOAD["email"], "password": "wrong"}
    for _ in range(5):
        await client.post("/auth/login", json=bad)

    resp = await client.post("/auth/login", json=bad)
    assert resp.status_code == 429
    assert "detail" in resp.json()


@pytest.mark.asyncio
async def test_unknown_email_failures_do_not_lock_different_email(client):
    """Failures on email A should not affect email B."""
    await client.post("/auth/register", json=REGISTER_PAYLOAD)

    for _ in range(5):
        await client.post("/auth/login", json={
            "email": "other@charzo.in",
            "password": "wrong",
        })

    # Login with original email should still work
    resp = await client.post("/auth/login", json={
        "email": REGISTER_PAYLOAD["email"],
        "password": REGISTER_PAYLOAD["password"],
    })
    assert resp.status_code == 200
