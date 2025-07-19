from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from apps.usuarios.models import (
    Horario,
    UsuarioAsignaturaEstudiante,
    UsuarioCarrera,
    AsignaturaCarrera,
)
from .serializers import HorarioSerializer
from apps.core.permissions import IsAdminOrSuperAdmin


class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all().order_by("id_hora_clase")
    serializer_class = HorarioSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def get_queryset(self):
        user = self.request.user
        request = self.request
        semestre_id = request.query_params.get("id_semestre_lectivo")  # filtro opcional

        # Empezamos con todos los horarios y luego filtramos según rol
        queryset = Horario.objects.all()

        # 🧑‍🎓 Estudiante: solo ve horarios de asignaturas inscritas en su paralelo
        if user.id_rol.nombre_rol == "Estudiante":
            relaciones = UsuarioAsignaturaEstudiante.objects.filter(id_usuario=user)
            filtros = Q()
            for rel in relaciones:
                filtros |= Q(id_asignatura=rel.id_asignatura, paralelo=rel.paralelo)
            queryset = queryset.filter(filtros)

        # 👨‍🏫 Docente: solo ve sus propios horarios
        elif user.id_rol.nombre_rol == "Docente":
            queryset = queryset.filter(id_usuario=user)

        # 🎓 Admin (Director de carrera): solo ve horarios de sus carreras
        elif user.id_rol.nombre_rol == "Admin":
            # Obtener las carreras asociadas al usuario
            carreras_ids = UsuarioCarrera.objects.filter(id_usuario=user).values_list(
                "id_carrera", flat=True
            )
            # Obtener asignaturas asociadas a esas carreras
            asignaturas_ids = AsignaturaCarrera.objects.filter(
                id_carrera__in=carreras_ids
            ).values_list("id_asignatura", flat=True)
            # Filtrar horarios por esas asignaturas
            queryset = queryset.filter(id_asignatura__in=asignaturas_ids)

        # 🧑‍💼 SuperAdmin: ve todos los horarios sin restricciones
        elif user.id_rol.nombre_rol == "SuperAdmin":
            queryset = queryset

        else:
            return Horario.objects.none()

        # 📅 Filtro adicional por semestre lectivo si se proporciona en la URL
        if semestre_id:
            queryset = queryset.filter(id_semestre_lectivo=semestre_id)

        return queryset.order_by("id_hora_clase")

    def list(self, request, *args, **kwargs):
        """
        Devuelve los horarios visibles para el usuario según su rol y filtros.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="docente/(?P<id_usuario>[^/.]+)")
    def horarios_por_docente(self, request, id_usuario=None):
        """
        Devuelve todos los horarios de un docente específico.
        Solo accesible para administradores.
        """
        queryset = Horario.objects.filter(id_usuario=id_usuario).order_by(
            "id_hora_clase"
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="estudiante/(?P<id_usuario>[^/.]+)")
    def horarios_por_estudiante(self, request, id_usuario=None):
        """
        Devuelve todos los horarios de un estudiante específico según sus asignaturas inscritas.
        Solo accesible para administradores.
        """
        relaciones = UsuarioAsignaturaEstudiante.objects.filter(id_usuario=id_usuario)
        filtros = Q()
        for rel in relaciones:
            filtros |= Q(id_asignatura=rel.id_asignatura, paralelo=rel.paralelo)
        queryset = Horario.objects.filter(filtros).order_by("id_hora_clase")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
