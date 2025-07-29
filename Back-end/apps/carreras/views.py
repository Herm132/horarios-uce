from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.forms.models import model_to_dict
from apps.core.utils.logger import registrar_log
from .serializers import CarreraSerializer
from apps.usuarios.models import Carrera
from apps.core.permissions import IsAdminOrSuperAdmin


class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all().order_by('nombre')
    serializer_class = CarreraSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            carrera = serializer.save()
            registrar_log(request, "CREATE", "carrera", carrera.id_carrera, despues=model_to_dict(carrera))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            carrera = Carrera.objects.get(pk=pk)
            datos_antes = model_to_dict(carrera)

            serializer = self.get_serializer(carrera, data=request.data, partial=True)
            if serializer.is_valid():
                carrera = serializer.save()
                datos_despues = model_to_dict(carrera)
                registrar_log(request, "UPDATE", "carrera", carrera.id_carrera, datos_antes, datos_despues)
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            carrera = Carrera.objects.get(pk=pk)
            datos_antes = model_to_dict(carrera)
            registrar_log(request, "DELETE", "carrera", carrera.id_carrera, antes=datos_antes)
            carrera.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Carrera.DoesNotExist:
            return Response({"detail": "Carrera no encontrada."}, status=status.HTTP_404_NOT_FOUND)
