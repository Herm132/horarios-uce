from rest_framework import viewsets, status
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.hora_clase.serializers import HoraClaseSerializer
from apps.usuarios.models import HoraClase
from apps.core.permissions import IsAdminOrSuperAdmin
from rest_framework.permissions import IsAuthenticated
from apps.core.utils.logger import registrar_log


class HoraClaseViewSet(viewsets.ModelViewSet):
    queryset = HoraClase.objects.all()
    serializer_class = HoraClaseSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            hora = serializer.save()
            registrar_log(
                request,
                "CREATE",
                "hora_clase",
                hora.id_hora_clase,
                despues=model_to_dict(hora),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            hora = HoraClase.objects.get(pk=pk)
            datos_antes = model_to_dict(hora)

            serializer = self.get_serializer(hora, data=request.data, partial=True)
            if serializer.is_valid():
                hora = serializer.save()
                datos_despues = model_to_dict(hora)

                registrar_log(
                    request,
                    "UPDATE",
                    "hora_clase",
                    hora.id_hora_clase,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except HoraClase.DoesNotExist:
            return Response(
                {"detail": "Hora de clase no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def destroy(self, request, pk=None):
        try:
            hora = HoraClase.objects.get(pk=pk)
            datos_antes = model_to_dict(hora)

            registrar_log(
                request, "DELETE", "hora_clase", hora.id_hora_clase, antes=datos_antes
            )

            hora.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except HoraClase.DoesNotExist:
            return Response(
                {"detail": "Hora de clase no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
