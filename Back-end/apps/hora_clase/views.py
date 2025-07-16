from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.hora_clase.serializers import HoraClaseSerializer
from apps.usuarios.models import HoraClase
from apps.core.permissions import IsAdminOrSuperAdmin

class HoraClaseViewSet(viewsets.ModelViewSet):
    queryset = HoraClase.objects.all()
    serializer_class = HoraClaseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
