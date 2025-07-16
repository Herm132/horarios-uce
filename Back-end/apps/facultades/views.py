from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import FacultadSerializer
from apps.usuarios.models import Facultad
from apps.core.permissions import IsAdminOrSuperAdmin

class FacultadViewSet(viewsets.ModelViewSet):
    queryset = Facultad.objects.all().order_by('nombre')
    serializer_class = FacultadSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
