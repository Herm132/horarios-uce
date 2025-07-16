from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.usuarios.models import UsuarioAsignatura
from .serializers import UsuarioAsignaturaSerializer
from apps.core.permissions import IsAdminOrSuperAdmin

class UsuarioAsignaturaViewSet(viewsets.ModelViewSet):
    queryset = UsuarioAsignatura.objects.all().order_by('id')
    serializer_class = UsuarioAsignaturaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    @action(detail=False, methods=['get'], url_path='usuario/(?P<id_usuario>[^/.]+)')
    def listar_por_usuario(self, request, id_usuario=None):
        queryset = self.queryset.filter(id_usuario=id_usuario).order_by('id')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='asignatura/(?P<id_asignatura>[^/.]+)')
    def listar_por_asignatura(self, request, id_asignatura=None):
        queryset = self.queryset.filter(id_asignatura=id_asignatura).order_by('id')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
