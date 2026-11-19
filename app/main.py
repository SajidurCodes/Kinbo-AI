from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.v1.router import api_router
from app.core.exceptions.handlers import register_exception_handlers
from app.mcp.server import mcp_asgi_app, session_manager


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with session_manager.run():
        yield


app = FastAPI(title="AI Sales Agent API", lifespan=lifespan)
register_exception_handlers(app)
app.include_router(health_router)
app.include_router(api_router)
app.add_route("/mcp", mcp_asgi_app)