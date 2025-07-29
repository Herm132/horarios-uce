from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.forms.models import model_to_dict
from django.db.models import Q

from apps.usuarios.models import (
    Horario,
    UsuarioAsignaturaEstudiante,
    UsuarioCarrera,
    AsignaturaCarrera,
)
from .serializers import HorarioSerializer
from apps.core.permissions import IsAnyAuthenticatedUser
from apps.core.utils.logger import registrar_log


class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all().order_by("id_hora_clase")
    serializer_class = HorarioSerializer
    permission_classes = [IsAuthenticated, IsAnyAuthenticatedUser]

    def get_queryset(self):
        user = self.request.user
        request = self.request
        semestre_id = request.query_params.get("id_semestre_lectivo")

        queryset = Horario.objects.all()

        if user.id_rol.nombre_rol == "Estudiante":
            relaciones = UsuarioAsignaturaEstudiante.objects.filter(id_usuario=user)
            filtros = Q()
            for rel in relaciones:
                filtros |= Q(id_asignatura=rel.id_asignatura, paralelo=rel.paralelo)
            queryset = queryset.filter(filtros)

        elif user.id_rol.nombre_rol == "Docente":
            queryset = queryset.filter(id_usuario=user)

        elif user.id_rol.nombre_rol == "Admin":
            carreras_ids = UsuarioCarrera.objects.filter(id_usuario=user).values_list(
                "id_carrera", flat=True
            )
            asignaturas_ids = AsignaturaCarrera.objects.filter(
                id_carrera__in=carreras_ids
            ).values_list("id_asignatura", flat=True)
            queryset = queryset.filter(id_asignatura__in=asignaturas_ids)

        elif user.id_rol.nombre_rol == "SuperAdmin":
            pass

        else:
            return Horario.objects.none()

        if semestre_id:
            queryset = queryset.filter(id_semestre_lectivo=semestre_id)

        return queryset.order_by("id_hora_clase")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            horario = serializer.save()
            registrar_log(
                request,
                "CREATE",
                "horario",
                horario.id_horario,
                despues=model_to_dict(horario),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            horario = Horario.objects.get(pk=pk)
            datos_antes = model_to_dict(horario)

            serializer = self.get_serializer(horario, data=request.data, partial=True)
            if serializer.is_valid():
                horario = serializer.save()
                datos_despues = model_to_dict(horario)

                registrar_log(
                    request,
                    "UPDATE",
                    "horario",
                    horario.id_horario,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Horario.DoesNotExist:
            return Response(
                {"detail": "Horario no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            horario = Horario.objects.get(pk=pk)
            datos_antes = model_to_dict(horario)

            registrar_log(
                request, "DELETE", "horario", horario.id_horario, antes=datos_antes
            )

            horario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Horario.DoesNotExist:
            return Response(
                {"detail": "Horario no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"], url_path="docente/(?P<id_usuario>[^/.]+)")
    def horarios_por_docente(self, request, id_usuario=None):
        queryset = Horario.objects.filter(id_usuario=id_usuario).order_by(
            "id_hora_clase"
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="estudiante/(?P<id_usuario>[^/.]+)")
    def horarios_por_estudiante(self, request, id_usuario=None):
        # Obtener carreras del estudiante
        carreras_ids = UsuarioCarrera.objects.filter(id_usuario=id_usuario).values_list(
            "id_carrera", flat=True
        )
        asignaturas_ids_validas = AsignaturaCarrera.objects.filter(
            id_carrera__in=carreras_ids
        ).values_list("id_asignatura", flat=True)

        # Obtener solo relaciones válidas (asignaturas que estén en las carreras del estudiante)
        relaciones = UsuarioAsignaturaEstudiante.objects.filter(
            id_usuario=id_usuario, id_asignatura__in=asignaturas_ids_validas
        )

        # Si no hay relaciones válidas => devolver lista vacía inmediatamente
        if not relaciones.exists():
            return Response([])

        # Construir filtro con paralelo y asignatura
        filtros = Q()
        for rel in relaciones:
            filtros |= Q(id_asignatura=rel.id_asignatura, paralelo=rel.paralelo)

        if not filtros.children:
            return Response([])

        queryset = Horario.objects.filter(filtros).order_by("id_hora_clase")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
