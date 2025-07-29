from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.core.models.log_cambios import LogCambio
from apps.core.serializers.log_cambio_serializer import LogCambioSerializer
from apps.core.permissions import IsSuperAdmin


class LogCambioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogCambio.objects.select_related("usuario").order_by("-fecha_hora")
    serializer_class = LogCambioSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
