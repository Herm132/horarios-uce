from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.usuarios.models import UsuarioAsignatura
from .serializers import UsuarioAsignaturaSerializer
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.core.utils.logger import registrar_log


class UsuarioAsignaturaViewSet(viewsets.ModelViewSet):
    queryset = UsuarioAsignatura.objects.all().order_by("id")
    serializer_class = UsuarioAsignaturaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        relacion = serializer.save()

        registrar_log(
            request,
            "CREATE",
            "usuario_asignatura",
            relacion.id,
            despues=model_to_dict(relacion),
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        try:
            relacion = UsuarioAsignatura.objects.get(pk=pk)
            datos_antes = model_to_dict(relacion)

            serializer = self.get_serializer(relacion, data=request.data, partial=True)
            if serializer.is_valid():
                relacion = serializer.save()
                datos_despues = model_to_dict(relacion)

                registrar_log(
                    request,
                    "UPDATE",
                    "usuario_asignatura",
                    relacion.id,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UsuarioAsignatura.DoesNotExist:
            return Response(
                {"detail": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            relacion = UsuarioAsignatura.objects.get(pk=pk)
            datos_antes = model_to_dict(relacion)

            registrar_log(
                request, "DELETE", "usuario_asignatura", relacion.id, antes=datos_antes
            )

            relacion.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UsuarioAsignatura.DoesNotExist:
            return Response(
                {"detail": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"], url_path="usuario/(?P<id_usuario>[^/.]+)")
    def listar_por_usuario(self, request, id_usuario=None):
        queryset = self.queryset.filter(id_usuario=id_usuario).order_by("id")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=["get"], url_path="asignatura/(?P<id_asignatura>[^/.]+)"
    )
    def listar_por_asignatura(self, request, id_asignatura=None):
        queryset = self.queryset.filter(id_asignatura=id_asignatura).order_by("id")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
