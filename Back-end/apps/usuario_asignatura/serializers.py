from rest_framework import serializers
from apps.usuarios.models import UsuarioAsignatura, Usuario, Asignatura

# Serializer para mostrar datos del usuario (solo lectura)
class UsuarioSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombres', 'apellidos', 'correo']

# Serializer para mostrar datos de la asignatura (solo lectura)
class AsignaturaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ['id_asignatura', 'nombre', 'codigo', 'es_comun']

# Serializer principal con validación personalizada
class UsuarioAsignaturaSerializer(serializers.ModelSerializer):
    usuario = UsuarioSimpleSerializer(source='id_usuario', read_only=True)
    asignatura = AsignaturaSimpleSerializer(source='id_asignatura', read_only=True)

    # Solo escritura
    id_usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all(), write_only=True)
    id_asignatura = serializers.PrimaryKeyRelatedField(queryset=Asignatura.objects.all(), write_only=True)

    class Meta:
        model = UsuarioAsignatura
        fields = ['id', 'id_usuario', 'id_asignatura', 'usuario', 'asignatura', 'paralelo']

    def validate(self, data):
        """
        Evita duplicidad: el mismo docente con la misma asignatura y paralelo.
        """
        id_usuario = data.get("id_usuario")
        id_asignatura = data.get("id_asignatura")
        paralelo = data.get("paralelo")

        # Si estás actualizando, excluye el mismo ID
        if self.instance:
            exists = UsuarioAsignatura.objects.filter(
                id_usuario=id_usuario,
                id_asignatura=id_asignatura,
                paralelo=paralelo
            ).exclude(id=self.instance.id).exists()
        else:
            exists = UsuarioAsignatura.objects.filter(
                id_usuario=id_usuario,
                id_asignatura=id_asignatura,
                paralelo=paralelo
            ).exists()

        if exists:
            raise serializers.ValidationError("Este docente ya está asignado a esta asignatura y paralelo.")

        return data
