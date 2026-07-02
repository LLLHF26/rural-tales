"""管理端路由聚合"""

from fastapi import APIRouter
from app.api.admin.auth import router as auth_router
from app.api.admin.dashboard import router as dashboard_router
from app.api.admin.villages import router as villages_router
from app.api.admin.scripts import router as scripts_router
from app.api.admin.ai import router as ai_router
from app.api.admin.admins import router as admins_router
from app.api.admin.users import router as users_router
from app.api.admin.analytics import router as analytics_router
from app.api.admin.settings import router as settings_router

admin_router = APIRouter(prefix="/admin")
admin_router.include_router(auth_router)
admin_router.include_router(dashboard_router)
admin_router.include_router(villages_router)
admin_router.include_router(scripts_router)
admin_router.include_router(ai_router)
admin_router.include_router(admins_router)
admin_router.include_router(users_router)
admin_router.include_router(analytics_router)
admin_router.include_router(settings_router)
