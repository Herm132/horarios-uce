from rest_framework import serializers
from apps.usuarios.models import UsuarioAsignaturaEstudiante, Usuario, Asignatura


# Serializer de usuario (solo lectura)
class UsuarioSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id_usuario", "nombres", "apellidos", "correo"]


# Serializer de asignatura (solo lectura)
class AsignaturaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ["id_asignatura", "nombre", "codigo", "es_comun"]


# Serializer principal
class UsuarioAsignaturaEstudianteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSimpleSerializer(source="id_usuario", read_only=True)
    asignatura = AsignaturaSimpleSerializer(source="id_asignatura", read_only=True)

    id_usuario = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), write_only=True
    )
    id_asignatura = serializers.PrimaryKeyRelatedField(
        queryset=Asignatura.objects.all(), write_only=True
    )

    class Meta:
        model = UsuarioAsignaturaEstudiante
        fields = [
            "id",
            "id_usuario",
            "id_asignatura",
            "usuario",
            "asignatura",
            "paralelo",
        ]

    def validate(self, data):
        id_usuario = data["id_usuario"]
        id_asignatura = data["id_asignatura"]

        # Validar si ya está inscrito
        if UsuarioAsignaturaEstudiante.objects.filter(
            id_usuario=id_usuario, id_asignatura=id_asignatura
        ).exists():
            raise serializers.ValidationError(
                "Este estudiante ya está inscrito en esta asignatura."
            )

        # Validar si la asignatura pertenece a alguna carrera del estudiante
        from apps.usuarios.models import UsuarioCarrera, AsignaturaCarrera

        carreras_usuario = UsuarioCarrera.objects.filter(
            id_usuario=id_usuario
        ).values_list("id_carrera", flat=True)
        pertenece = AsignaturaCarrera.objects.filter(
            id_asignatura=id_asignatura, id_carrera__in=carreras_usuario
        ).exists()

        if not pertenece:
            raise serializers.ValidationError(
                "La asignatura no pertenece a ninguna carrera del estudiante."
            )

        return data

    def create(self, validated_data):
        instance = super().create(validated_data)
        total = UsuarioAsignaturaEstudiante.objects.filter(
            id_asignatura=instance.id_asignatura, paralelo=instance.paralelo
        ).count()

        self.context["response_data"] = {
            "message": "Estudiante inscrito correctamente.",
            "asignatura": {
                "id_asignatura": instance.id_asignatura.id_asignatura,
                "nombre": instance.id_asignatura.nombre,
                "codigo": instance.id_asignatura.codigo,
            },
            "paralelo": instance.paralelo,
            "total_estudiantes_registrados": total,
        }
        return instance

    usuario = UsuarioSimpleSerializer(source="id_usuario", read_only=True)
    asignatura = AsignaturaSimpleSerializer(source="id_asignatura", read_only=True)

    # Campos de escritura
    id_usuario = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), write_only=True
    )
    id_asignatura = serializers.PrimaryKeyRelatedField(
        queryset=Asignatura.objects.all(), write_only=True
    )

    class Meta:
        model = UsuarioAsignaturaEstudiante
        fields = [
            "id",
            "id_usuario",
            "id_asignatura",
            "usuario",
            "asignatura",
            "paralelo",
        ]
