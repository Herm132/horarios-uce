from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from apps.usuarios.models import AsignaturaCarrera
from .serializers import AsignaturaCarreraSerializer
from apps.core.permissions import IsAdminOrSuperAdmin


class AsignaturaCarreraViewSet(viewsets.ModelViewSet):
    queryset = AsignaturaCarrera.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    serializer_class = AsignaturaCarreraSerializer

    def create(self, request, *args, **kwargs):
        """
        POST único o múltiple en el mismo endpoint:
        {
            "id_asignatura": 1,
            "id_carrera": [2, 3, 4]  ✅ múltiples
        }
        o
        {
            "id_asignatura": 1,
            "id_carrera": 2  ✅ único
        }
        """
        data = request.data
        id_asignatura = data.get("id_asignatura")
        id_carreras = data.get("id_carrera")

        if not isinstance(id_carreras, list):
            id_carreras = [id_carreras]  # convertir a lista si es uno solo

        nuevas_relaciones = []
        for id_carrera in id_carreras:
            exists = AsignaturaCarrera.objects.filter(
                id_asignatura=id_asignatura,
                id_carrera=id_carrera
            ).exists()
            if not exists:
                nuevas_relaciones.append(AsignaturaCarrera(
                    id_asignatura_id=id_asignatura,
                    id_carrera_id=id_carrera
                ))

        relaciones_creadas = AsignaturaCarrera.objects.bulk_create(nuevas_relaciones)

        return Response(
            AsignaturaCarreraSerializer(relaciones_creadas, many=True).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='asignatura/(?P<id_asignatura>[^/.]+)')
    def listar_por_asignatura(self, request, id_asignatura=None):
        relaciones = self.queryset.filter(id_asignatura=id_asignatura)
        if not relaciones.exists():
            return Response({"detail": "No se encontraron carreras para esta asignatura."}, status=404)

        asignatura = relaciones.first().id_asignatura
        carreras = [rel.id_carrera for rel in relaciones]

        return Response({
            "asignatura": {
                "id_asignatura": asignatura.id_asignatura,
                "nombre": asignatura.nombre,
                "codigo": asignatura.codigo,
                "horas_clase": asignatura.horas_clase,
                "horas_pae": asignatura.horas_pae,
                "semestre": asignatura.semestre,
                "es_comun": asignatura.es_comun
            },
            "carreras": [
                {
                    "id_carrera": c.id_carrera,
                    "nombre": c.nombre,
                    "codigo": c.codigo
                } for c in carreras
            ]
        })

    @action(detail=False, methods=['get'], url_path='carrera/(?P<id_carrera>[^/.]+)')
    def listar_por_carrera(self, request, id_carrera=None):
        relaciones = self.queryset.filter(id_carrera=id_carrera)
        if not relaciones.exists():
            return Response({"detail": "No se encontraron asignaturas para esta carrera."}, status=404)

        carrera = relaciones.first().id_carrera
        asignaturas = [rel.id_asignatura for rel in relaciones]

        return Response({
            "carrera": {
                "id_carrera": carrera.id_carrera,
                "nombre": carrera.nombre,
                "codigo": carrera.codigo
            },
            "asignaturas": [
                {
                    "id_asignatura": a.id_asignatura,
                    "nombre": a.nombre,
                    "codigo": a.codigo,
                    "horas_clase": a.horas_clase,
                    "horas_pae": a.horas_pae,
                    "semestre": a.semestre,
                    "es_comun": a.es_comun
                } for a in asignaturas
            ]
        })
