from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioAsignaturaViewSet

router = DefaultRouter()
router.register(r'usuario-asignatura', UsuarioAsignaturaViewSet, basename='usuario-asignatura')

urlpatterns = [
    path('', include(router.urls)),
]    