from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.usuarios.models import UsuarioCarrera, Usuario, Carrera
from apps.usuario_carrera.serializers import UsuarioCarreraSerializer
from apps.core.permissions import IsAdminOrSuperAdmin

class UsuarioCarreraViewSet(viewsets.ModelViewSet):
    queryset = UsuarioCarrera.objects.all()
    serializer_class = UsuarioCarreraSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    @action(detail=False, methods=['get'], url_path='usuario/(?P<id_usuario>[^/.]+)')
    def listar_por_usuario(self, request, id_usuario=None):
        relaciones = self.queryset.filter(id_usuario=id_usuario)
        carreras = [
            {
                "id_carrera": uc.id_carrera.id_carrera,
                "nombre": uc.id_carrera.nombre,
                "codigo": uc.id_carrera.codigo
            } for uc in relaciones
        ]
        usuario = Usuario.objects.get(id_usuario=id_usuario)
        return Response({
            "usuario": {
                "id_usuario": usuario.id_usuario,
                "nombres": usuario.nombres,
                "apellidos": usuario.apellidos,
                "correo": usuario.correo
            },
            "carreras": carreras
        })

    @action(detail=False, methods=['get'], url_path='carrera/(?P<id_carrera>[^/.]+)')
    def listar_por_carrera(self, request, id_carrera=None):
        relaciones = self.queryset.filter(id_carrera=id_carrera)
        usuarios = [
            {
                "id_usuario": uc.id_usuario.id_usuario,
                "nombres": uc.id_usuario.nombres,
                "apellidos": uc.id_usuario.apellidos,
                "correo": uc.id_usuario.correo
            } for uc in relaciones
        ]
        carrera = Carrera.objects.get(id_carrera=id_carrera)
        return Response({
            "carrera": {
                "id_carrera": carrera.id_carrera,
                "nombre": carrera.nombre,
                "codigo": carrera.codigo
            },
            "usuarios": usuarios
        })