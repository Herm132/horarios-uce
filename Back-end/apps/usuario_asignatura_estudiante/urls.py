from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioAsignaturaEstudianteViewSet

router = DefaultRouter()
router.register(r'usu-asig-estudiante', UsuarioAsignaturaEstudianteViewSet, basename='usuario-asignatura-estudiante')

urlpatterns = [
    path('', include(router.urls)),
]