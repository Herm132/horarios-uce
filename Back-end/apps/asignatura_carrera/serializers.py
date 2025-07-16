from rest_framework import serializers
from apps.usuarios.models import AsignaturaCarrera, Asignatura, Carrera

# --- Serializador para mostrar info de la asignatura ---
class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ['id_asignatura', 'nombre', 'codigo', 'es_comun', 'horas_clase', 'horas_pae', 'semestre']

# --- Serializador para mostrar info de la carrera ---
class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ['id_carrera', 'nombre', 'codigo']

# --- Serializer para GET, PUT, DELETE (uno solo) ---
class AsignaturaCarreraSerializer(serializers.ModelSerializer):
    asignatura = AsignaturaSerializer(source='id_asignatura', read_only=True)
    carrera = CarreraSerializer(source='id_carrera', read_only=True)

    id_asignatura = serializers.PrimaryKeyRelatedField(queryset=Asignatura.objects.all(), write_only=True)
    id_carrera = serializers.PrimaryKeyRelatedField(queryset=Carrera.objects.all(), write_only=True)

    class Meta:
        model = AsignaturaCarrera
        fields = ['id', 'id_asignatura', 'id_carrera', 'asignatura', 'carrera']

# --- Serializer para POST múltiple (solo para create) ---
class AsignaturaCarreraBulkSerializer(serializers.Serializer):
    id_asignatura = serializers.PrimaryKeyRelatedField(queryset=Asignatura.objects.all())
    id_carrera = serializers.ListField(child=serializers.IntegerField())

    def create(self, validated_data):
        id_asignatura = validated_data['id_asignatura']
        carrera_ids = validated_data['id_carrera']
        carreras = Carrera.objects.filter(id_carrera__in=carrera_ids)

        relaciones = []
        for carrera in carreras:
            if not AsignaturaCarrera.objects.filter(id_asignatura=id_asignatura, id_carrera=carrera).exists():
                relaciones.append(AsignaturaCarrera(id_asignatura=id_asignatura, id_carrera=carrera))

        return AsignaturaCarrera.objects.bulk_create(relaciones)
