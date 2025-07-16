from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from apps.usuarios.models import Horario, UsuarioAsignaturaEstudiante
from .serializers import HorarioSerializer
from apps.core.permissions import IsAdminOrSuperAdmin
class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all().order_by('id_hora_clase')
    serializer_class = HorarioSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get_queryset(self):
        user = self.request.user

        # Admin y SuperAdmin ven todos los horarios
        if user.id_rol.nombre_rol in ['SuperAdmin', 'Admin']:
            return Horario.objects.all().order_by('id_hora_clase')

        # Docente: solo sus horarios
        if user.id_rol.nombre_rol == 'Docente':
            return Horario.objects.filter(id_usuario=user).order_by('id_hora_clase')

        # Estudiante: solo horarios de asignaturas inscritas
        if user.id_rol.nombre_rol == 'Estudiante':
            relaciones = UsuarioAsignaturaEstudiante.objects.filter(id_usuario=user)
            filtros = Q()
            for rel in relaciones:
                filtros |= Q(id_asignatura=rel.id_asignatura, paralelo=rel.paralelo)
            return Horario.objects.filter(filtros).order_by('id_hora_clase')

        return Horario.objects.none()

    def list(self, request, *args, **kwargs):
        """
        Devuelve los horarios visibles para el usuario según su rol.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='docente/(?P<id_usuario>[^/.]+)')
    def horarios_por_docente(self, request, id_usuario=None):
        """
        Devuelve todos los horarios del docente con ID dado.
        Solo para uso del administrador.
        """
        queryset = Horario.objects.filter(id_usuario=id_usuario).order_by('id_hora_clase')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='estudiante/(?P<id_usuario>[^/.]+)')
    def horarios_por_estudiante(self, request, id_usuario=None):
        """
        Devuelve todos los horarios de las asignaturas que cursa un estudiante específico.
        Solo para uso del administrador.
        """
        relaciones = UsuarioAsignaturaEstudiante.objects.filter(id_usuario=id_usuario)
        filtros = Q()
        for rel in relaciones:
            filtros |= Q(id_asignatura=rel.id_asignatura, paralelo=rel.paralelo)
        queryset = Horario.objects.filter(filtros).order_by('id_hora_clase')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
