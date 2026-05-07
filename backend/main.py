import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/api/health")
def health():
    return {"status": "ok"}


static_dir = os.environ.get(
    "STATIC_DIR",
    os.path.join(os.path.dirname(__file__), "..", "frontend", "out"),
)
# All API routers must be registered before this mount — the "/" catch-all
# intercepts any request not matched by a preceding route.
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
