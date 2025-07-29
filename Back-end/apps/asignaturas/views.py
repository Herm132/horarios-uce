from rest_framework import viewsets, status
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.usuarios.models import Asignatura
from .serializers import AsignaturaSerializer
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.core.utils.logger import registrar_log


class AsignaturaViewSet(viewsets.ModelViewSet):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            asignatura = serializer.save()
            registrar_log(
                request,
                "CREATE",
                "asignatura",
                asignatura.id_asignatura,
                despues=model_to_dict(asignatura),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            asignatura = Asignatura.objects.get(pk=pk)
            datos_antes = model_to_dict(asignatura)

            serializer = self.get_serializer(
                asignatura, data=request.data, partial=True
            )
            if serializer.is_valid():
                asignatura = serializer.save()
                datos_despues = model_to_dict(asignatura)

                registrar_log(
                    request,
                    "UPDATE",
                    "asignatura",
                    asignatura.id_asignatura,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Asignatura.DoesNotExist:
            return Response(
                {"detail": "Asignatura no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def destroy(self, request, pk=None):
        try:
            asignatura = Asignatura.objects.get(pk=pk)
            datos_antes = model_to_dict(asignatura)

            registrar_log(
                request,
                "DELETE",
                "asignatura",
                asignatura.id_asignatura,
                antes=datos_antes,
            )

            asignatura.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Asignatura.DoesNotExist:
            return Response(
                {"detail": "Asignatura no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
