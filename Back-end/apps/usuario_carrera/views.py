from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.usuarios.models import UsuarioCarrera, Usuario, Carrera
from apps.usuario_carrera.serializers import UsuarioCarreraSerializer
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.core.utils.logger import registrar_log


class UsuarioCarreraViewSet(viewsets.ModelViewSet):
    queryset = UsuarioCarrera.objects.all()
    serializer_class = UsuarioCarreraSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            relacion = serializer.save()
            registrar_log(
                request,
                "CREATE",
                "usuario_carrera",
                relacion.id,
                despues=model_to_dict(relacion),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            relacion = UsuarioCarrera.objects.get(pk=pk)
            datos_antes = model_to_dict(relacion)

            serializer = self.get_serializer(relacion, data=request.data, partial=True)
            if serializer.is_valid():
                relacion = serializer.save()
                datos_despues = model_to_dict(relacion)
                registrar_log(
                    request,
                    "UPDATE",
                    "usuario_carrera",
                    relacion.id,
                    antes=datos_antes,
                    despues=datos_despues,
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UsuarioCarrera.DoesNotExist:
            return Response(
                {"detail": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            relacion = UsuarioCarrera.objects.get(pk=pk)
            datos_antes = model_to_dict(relacion)
            registrar_log(
                request, "DELETE", "usuario_carrera", relacion.id, antes=datos_antes
            )
            relacion.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UsuarioCarrera.DoesNotExist:
            return Response(
                {"detail": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"], url_path="usuario/(?P<id_usuario>[^/.]+)")
    def listar_por_usuario(self, request, id_usuario=None):
        relaciones = self.queryset.filter(id_usuario=id_usuario)
        carreras = [
            {
                "id_carrera": uc.id_carrera.id_carrera,
                "nombre": uc.id_carrera.nombre,
                "codigo": uc.id_carrera.codigo,
            }
            for uc in relaciones
        ]
        usuario = Usuario.objects.get(id_usuario=id_usuario)
        return Response(
            {
                "usuario": {
                    "id_usuario": usuario.id_usuario,
                    "nombres": usuario.nombres,
                    "apellidos": usuario.apellidos,
                    "correo": usuario.correo,
                },
                "carreras": carreras,
            }
        )

    @action(detail=False, methods=["get"], url_path="carrera/(?P<id_carrera>[^/.]+)")
    def listar_por_carrera(self, request, id_carrera=None):
        relaciones = self.queryset.filter(id_carrera=id_carrera)
        usuarios = [
            {
                "id_usuario": uc.id_usuario.id_usuario,
                "nombres": uc.id_usuario.nombres,
                "apellidos": uc.id_usuario.apellidos,
                "correo": uc.id_usuario.correo,
            }
            for uc in relaciones
        ]
        carrera = Carrera.objects.get(id_carrera=id_carrera)
        return Response(
            {
                "carrera": {
                    "id_carrera": carrera.id_carrera,
                    "nombre": carrera.nombre,
                    "codigo": carrera.codigo,
                },
                "usuarios": usuarios,
            }
        )
