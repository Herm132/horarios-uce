from rest_framework import viewsets, status
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.aulas.serializers import AulaSerializer
from apps.usuarios.models import Aula
from apps.core.permissions import IsAdminOrSuperAdmin
from rest_framework.permissions import IsAuthenticated
from apps.core.utils.logger import registrar_log


class AulaViewSet(viewsets.ModelViewSet):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            aula = serializer.save()
            registrar_log(
                request, "CREATE", "aula", aula.id_aula, despues=model_to_dict(aula)
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            aula = Aula.objects.get(pk=pk)
            datos_antes = model_to_dict(aula)

            serializer = self.get_serializer(aula, data=request.data, partial=True)
            if serializer.is_valid():
                aula = serializer.save()
                datos_despues = model_to_dict(aula)

                registrar_log(
                    request,
                    "UPDATE",
                    "aula",
                    aula.id_aula,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Aula.DoesNotExist:
            return Response(
                {"detail": "Aula no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            aula = Aula.objects.get(pk=pk)
            datos_antes = model_to_dict(aula)

            registrar_log(request, "DELETE", "aula", aula.id_aula, antes=datos_antes)

            aula.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Aula.DoesNotExist:
            return Response(
                {"detail": "Aula no encontrada."}, status=status.HTTP_404_NOT_FOUND
            )
