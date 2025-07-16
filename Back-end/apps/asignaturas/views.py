from rest_framework import viewsets
from apps.usuarios.models import Asignatura
from .serializers import AsignaturaSerializer
from apps.core.permissions import IsAdminOrSuperAdmin

class AsignaturaViewSet(viewsets.ModelViewSet):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    permission_classes = [IsAdminOrSuperAdmin]
