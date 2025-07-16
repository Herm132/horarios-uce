from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import CarreraSerializer
from apps.usuarios.models import Carrera
from apps.core.permissions import IsAdminOrSuperAdmin

class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all().order_by('nombre')
    serializer_class = CarreraSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
