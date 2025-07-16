from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioCarreraViewSet

router = DefaultRouter()
router.register(r'usuario-carrera', UsuarioCarreraViewSet, basename='usuario-carrera')

urlpatterns = [
    path('', include(router.urls)),
]