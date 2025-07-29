from rest_framework import viewsets, status
from rest_framework.response import Response
from django.forms.models import model_to_dict

from apps.usuarios.models import SemestreLectivo
from .serializers import SemestreLectivoSerializer
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.core.utils.logger import registrar_log


class SemestreLectivoViewSet(viewsets.ModelViewSet):
    queryset = SemestreLectivo.objects.all()
    serializer_class = SemestreLectivoSerializer
    permission_classes = [IsAdminOrSuperAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            semestre = serializer.save()
            registrar_log(
                request,
                "CREATE",
                "semestre_lectivo",
                semestre.id_semestre_lectivo,
                despues=model_to_dict(semestre),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            semestre = SemestreLectivo.objects.get(pk=pk)
            datos_antes = model_to_dict(semestre)

            serializer = self.get_serializer(semestre, data=request.data, partial=True)
            if serializer.is_valid():
                semestre = serializer.save()
                datos_despues = model_to_dict(semestre)

                registrar_log(
                    request,
                    "UPDATE",
                    "semestre_lectivo",
                    semestre.id_semestre_lectivo,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except SemestreLectivo.DoesNotExist:
            return Response(
                {"detail": "Semestre no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            semestre = SemestreLectivo.objects.get(pk=pk)
            datos_antes = model_to_dict(semestre)

            registrar_log(
                request,
                "DELETE",
                "semestre_lectivo",
                semestre.id_semestre_lectivo,
                antes=datos_antes,
            )

            semestre.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except SemestreLectivo.DoesNotExist:
            return Response(
                {"detail": "Semestre no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )
