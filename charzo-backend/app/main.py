import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.core.exceptions import global_exception_handler
from app.core.rate_limiter import limiter
from app.middleware import RequestIDMiddleware
from app.routers import admin, auth, requests, users, vehicles

logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("charzo")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CHARZO API starting — environment: %s", settings.environment)
    yield
    logger.info("CHARZO API shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="CHARZO API",
        description="Production-grade EV charging platform API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    # Attach rate limiter to app state
    app.state.limiter = limiter

    # ── Middleware (outermost first) ──────────────────────────────────────
    if settings.is_production:
        app.add_middleware(HTTPSRedirectMiddleware)

    allowed_hosts = ["charzo.in", "www.charzo.in", "charzo.vercel.app", "*.railway.app"]
    if not settings.is_production:
        allowed_hosts += ["localhost", "127.0.0.1", "test", "testclient"]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin, "http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(SlowAPIMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(vehicles.router)
    app.include_router(requests.router)
    app.include_router(admin.router)

    # ── Health endpoint ───────────────────────────────────────────────────
    @app.get("/health", tags=["system"])
    @limiter.limit("100/minute")
    async def health(request: Request):
        if settings.is_production and settings.health_api_key:
            api_key = request.headers.get("X-Health-Key", "")
            if api_key != settings.health_api_key:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
        return {"status": "ok", "environment": settings.environment, "version": "1.0.0"}

    return app


app = create_app()
