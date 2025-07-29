from rest_framework import viewsets, status
from rest_framework.response import Response
from django.forms.models import model_to_dict

from .serializers import FacultadSerializer
from apps.usuarios.models import Facultad
from apps.core.permissions import IsAdminOrSuperAdmin
from rest_framework.permissions import IsAuthenticated
from apps.core.utils.logger import registrar_log


class FacultadViewSet(viewsets.ModelViewSet):
    queryset = Facultad.objects.all().order_by("nombre")
    serializer_class = FacultadSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            facultad = serializer.save()
            registrar_log(
                request,
                "CREATE",
                "facultad",
                facultad.id_facultad,
                despues=model_to_dict(facultad),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            facultad = Facultad.objects.get(pk=pk)
            datos_antes = model_to_dict(facultad)

            serializer = self.get_serializer(facultad, data=request.data, partial=True)
            if serializer.is_valid():
                facultad = serializer.save()
                datos_despues = model_to_dict(facultad)

                registrar_log(
                    request,
                    "UPDATE",
                    "facultad",
                    facultad.id_facultad,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Facultad.DoesNotExist:
            return Response(
                {"detail": "Facultad no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            facultad = Facultad.objects.get(pk=pk)
            datos_antes = model_to_dict(facultad)

            registrar_log(
                request, "DELETE", "facultad", facultad.id_facultad, antes=datos_antes
            )

            facultad.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Facultad.DoesNotExist:
            return Response(
                {"detail": "Facultad no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )
