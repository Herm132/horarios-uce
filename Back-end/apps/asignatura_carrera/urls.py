from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AsignaturaCarreraViewSet

router = DefaultRouter()
router.register(r'asignatura-carrera', AsignaturaCarreraViewSet, basename='asignatura-carrera')

urlpatterns = [
    path('', include(router.urls)),
]
