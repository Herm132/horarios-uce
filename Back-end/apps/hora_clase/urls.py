from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HoraClaseViewSet

router = DefaultRouter()
router.register(r'hora-clase', HoraClaseViewSet, basename='hora-clase')

urlpatterns = [
    path('', include(router.urls)),
]
