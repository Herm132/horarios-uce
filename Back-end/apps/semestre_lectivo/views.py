from rest_framework import viewsets
from apps.usuarios.models import SemestreLectivo
from .serializers import SemestreLectivoSerializer
from apps.core.permissions import IsAdminOrSuperAdmin


class SemestreLectivoViewSet(viewsets.ModelViewSet):
    queryset = SemestreLectivo.objects.all()
    serializer_class = SemestreLectivoSerializer
    permission_classes = [IsAdminOrSuperAdmin]
