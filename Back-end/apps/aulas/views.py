from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.aulas.serializers import AulaSerializer
from apps.usuarios.models import Aula
from apps.core.permissions import IsAdminOrSuperAdmin

class AulaViewSet(viewsets.ModelViewSet):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]