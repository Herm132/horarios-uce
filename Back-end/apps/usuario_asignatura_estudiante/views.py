from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.usuarios.models import UsuarioAsignaturaEstudiante
from .serializers import UsuarioAsignaturaEstudianteSerializer
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.core.utils.logger import registrar_log


class UsuarioAsignaturaEstudianteViewSet(viewsets.ModelViewSet):
    queryset = UsuarioAsignaturaEstudiante.objects.all().order_by("id")
    serializer_class = UsuarioAsignaturaEstudianteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def list(self, request, *args, **kwargs):
        id_usuario = request.query_params.get("usuario")
        id_asignatura = request.query_params.get("asignatura")

        queryset = self.queryset

        if id_usuario:
            queryset = queryset.filter(id_usuario=id_usuario)
        if id_asignatura:
            queryset = queryset.filter(id_asignatura=id_asignatura)

        serializer = self.get_serializer(queryset, many=True)
        return Response({"total": queryset.count(), "resultados": serializer.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        relacion = serializer.save()

        registrar_log(
            request,
            "CREATE",
            "usuario_asignatura_estudiante",
            relacion.id,
            despues=model_to_dict(relacion),
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        try:
            relacion = UsuarioAsignaturaEstudiante.objects.get(pk=pk)
            datos_antes = model_to_dict(relacion)

            serializer = self.get_serializer(relacion, data=request.data, partial=True)
            if serializer.is_valid():
                relacion = serializer.save()
                datos_despues = model_to_dict(relacion)

                registrar_log(
                    request,
                    "UPDATE",
                    "usuario_asignatura_estudiante",
                    relacion.id,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UsuarioAsignaturaEstudiante.DoesNotExist:
            return Response(
                {"detail": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            relacion = UsuarioAsignaturaEstudiante.objects.get(pk=pk)
            datos_antes = model_to_dict(relacion)

            registrar_log(
                request,
                "DELETE",
                "usuario_asignatura_estudiante",
                relacion.id,
                antes=datos_antes,
            )

            relacion.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UsuarioAsignaturaEstudiante.DoesNotExist:
            return Response(
                {"detail": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )
