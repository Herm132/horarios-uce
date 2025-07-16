from rest_framework import serializers
from apps.usuarios.models import UsuarioCarrera, Usuario, Carrera

class UsuarioCarreraSerializer(serializers.ModelSerializer):
    # Mostrar datos de usuario y carrera en respuestas GET
    usuario = serializers.SerializerMethodField(read_only=True)
    carrera = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UsuarioCarrera
        fields = ['id', 'id_usuario', 'id_carrera', 'usuario', 'carrera']

    def get_usuario(self, obj):
        return {
            "id_usuario": obj.id_usuario.id_usuario,
            "nombres": obj.id_usuario.nombres,
            "apellidos": obj.id_usuario.apellidos,
            "correo": obj.id_usuario.correo
        }

    def get_carrera(self, obj):
        return {
            "id_carrera": obj.id_carrera.id_carrera,
            "nombre": obj.id_carrera.nombre,
            "codigo": obj.id_carrera.codigo
        }

    def validate(self, data):
        """
        Verifica que la relación usuario-carrera no exista ya.
        """
        usuario = data.get("id_usuario")
        carrera = data.get("id_carrera")

        if UsuarioCarrera.objects.filter(id_usuario=usuario, id_carrera=carrera).exists():
            raise serializers.ValidationError("El usuario ya está registrado en esta carrera.")

        return data