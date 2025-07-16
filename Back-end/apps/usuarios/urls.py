from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegistroView, UsuarioViewSet

router = DefaultRouter()
router.register(r'', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registro/', RegistroView.as_view(), name='registro'),
    path('', include(router.urls)),
]
