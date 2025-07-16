from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from apps.usuarios.models import UsuarioAsignaturaEstudiante
from .serializers import UsuarioAsignaturaEstudianteSerializer
from apps.core.permissions import IsAdminOrSuperAdmin

class UsuarioAsignaturaEstudianteViewSet(viewsets.ModelViewSet):
    queryset = UsuarioAsignaturaEstudiante.objects.all().order_by('id')
    serializer_class = UsuarioAsignaturaEstudianteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def list(self, request, *args, **kwargs):
        id_usuario = request.query_params.get('usuario')
        id_asignatura = request.query_params.get('asignatura')

        queryset = self.queryset

        if id_usuario:
            queryset = queryset.filter(id_usuario=id_usuario)
        if id_asignatura:
            queryset = queryset.filter(id_asignatura=id_asignatura)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "total": queryset.count(),
            "resultados": serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        response_data = serializer.context.get('response_data')
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)