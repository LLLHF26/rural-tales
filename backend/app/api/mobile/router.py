"""移动端路由聚合"""

from fastapi import APIRouter
from app.api.mobile.auth import router as auth_router
from app.api.mobile.scripts import router as scripts_router
from app.api.mobile.play import router as play_router
from app.api.mobile.ar import router as ar_router
from app.api.mobile.villages import router as villages_router
from app.api.mobile.upload import router as upload_router

mobile_router = APIRouter(prefix="/v1")
mobile_router.include_router(auth_router)
mobile_router.include_router(scripts_router)
mobile_router.include_router(play_router)
mobile_router.include_router(ar_router)
mobile_router.include_router(villages_router)
mobile_router.include_router(upload_router)
