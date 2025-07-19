from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SemestreLectivoViewSet

router = DefaultRouter()
router.register(
    r"semestre-lectivo", SemestreLectivoViewSet, basename="semestre-lectivo"
)

urlpatterns = [
    path("", include(router.urls)),
]
