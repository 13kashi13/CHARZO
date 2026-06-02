import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.exceptions import global_exception_handler
from app.middleware import RequestIDMiddleware
from app.routers import admin, auth, requests, users, vehicles

# ── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("charzo")


def create_app() -> FastAPI:
    app = FastAPI(
        title="CHARZO API",
        description="Production-grade EV charging platform API",
        version="1.0.0",
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    # ── Middleware (outermost first) ──────────────────────────────────────
    # 1. HTTPS redirect — production only
    if settings.is_production:
        app.add_middleware(HTTPSRedirectMiddleware)

    # 2. Trusted host
    allowed_hosts = ["charzo.in", "www.charzo.in", "charzo.vercel.app", "*.railway.app"]
    if not settings.is_production:
        allowed_hosts += ["localhost", "127.0.0.1", "test", "testclient"]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

    # 3. CORS — locked to frontend origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin, "http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 4. X-Request-ID
    app.add_middleware(RequestIDMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────
    app.add_exception_handler(Exception, global_exception_handler)

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(vehicles.router)
    app.include_router(requests.router)
    app.include_router(admin.router)

    # ── Health endpoint ───────────────────────────────────────────────────
    @app.get("/health", tags=["system"])
    async def health(request: Request):
        # In production, optionally require API key
        if settings.is_production and settings.health_api_key:
            api_key = request.headers.get("X-Health-Key", "")
            if api_key != settings.health_api_key:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
        return {"status": "ok", "environment": settings.environment, "version": "1.0.0"}

    # ── Startup / shutdown ────────────────────────────────────────────────
    @app.on_event("startup")
    async def on_startup():
        logger.info("CHARZO API starting — environment: %s", settings.environment)

    @app.on_event("shutdown")
    async def on_shutdown():
        logger.info("CHARZO API shutting down")

    return app


app = create_app()
