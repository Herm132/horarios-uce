from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.core.views.logs_view import LogCambioViewSet

router = DefaultRouter()
router.register(r"logs", LogCambioViewSet, basename="logs")

urlpatterns = [
    path("", include(router.urls)),
]
