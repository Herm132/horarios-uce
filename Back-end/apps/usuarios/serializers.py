from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import Usuario, Rol, Docente, UsuarioCarrera, Carrera


# Este sirve para iniciar sesión con correo y password.
class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        correo = data.get("correo")
        password = data.get("password")

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Usuario no encontrado")

        if not check_password(password, usuario.password):
            raise serializers.ValidationError("Contraseña incorrecta")

        data["usuario"] = usuario
        return data


# (para mostrar datos del usuario luego del login)
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ["id_rol", "nombre_rol"]


class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ["id_carrera", "nombre", "codigo"]


# UsuarioSerializer (para mostrar datos del usuario luego del login)
class UsuarioSerializer(serializers.ModelSerializer):
    rol = RolSerializer(source="id_rol")
    carreras = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "nombres",
            "apellidos",
            "correo",
            "cedula",
            "rol",
            "carreras",
        ]

    def get_carreras(self, obj):
        usuario_carreras = UsuarioCarrera.objects.filter(id_usuario=obj).select_related(
            "id_carrera"
        )
        return [
            {
                "id_carrera": uc.id_carrera.id_carrera,
                "nombre": uc.id_carrera.nombre,
                "codigo": uc.id_carrera.codigo,
            }
            for uc in usuario_carreras
        ]


# Este serializador permite registrar cualquier usuario, pero si el id_rol == 2 (docente), se validan y guardan los campos extras.
# Si id_rol = 1 o 2: el campo carreras es obligatorio y debe contener al menos un ID válido. Si id_rol = 3 o 4: el campo se puede omitir o dejar vacío.
class RegistroSerializer(serializers.ModelSerializer):
    # Campos adicionales para Docente (solo entrada)
    modalidad_contratacion = serializers.CharField(required=False, write_only=True)
    tiempo_dedicacion = serializers.CharField(required=False, write_only=True)

    # Entrada
    carreras = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    id_rol = serializers.IntegerField(write_only=True)

    # Salida
    rol_info = RolSerializer(source="id_rol", read_only=True)
    carreras_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "nombres",
            "apellidos",
            "cedula",
            "correo",
            "password",
            "id_rol",  # entrada
            "rol_info",  # salida
            "modalidad_contratacion",
            "tiempo_dedicacion",
            "carreras",  # entrada
            "carreras_info",  # salida
        ]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    def validate(self, data):
        rol_id = data.get("id_rol")
        carreras = data.get("carreras")

        if rol_id in [1, 2]:  # estudiante o docente
            if not carreras or not isinstance(carreras, list) or len(carreras) == 0:
                raise serializers.ValidationError(
                    "Debes proporcionar al menos una carrera para este rol."
                )

        if rol_id == 2:
            if not data.get("modalidad_contratacion") or not data.get(
                "tiempo_dedicacion"
            ):
                raise serializers.ValidationError(
                    "Debes completar los campos de docente."
                )

        return data

    def create(self, validated_data):
        modalidad = validated_data.pop("modalidad_contratacion", None)
        dedicacion = validated_data.pop("tiempo_dedicacion", None)
        carreras = validated_data.pop("carreras", [])
        rol_id = validated_data.pop("id_rol")

        # Aquí obtenemos la instancia del rol, porque es ForeignKey
        try:
            rol = Rol.objects.get(pk=rol_id)
        except Rol.DoesNotExist:
            raise serializers.ValidationError("Rol no válido")

        validated_data["id_rol"] = rol
        validated_data["password"] = make_password(validated_data["password"])

        usuario = Usuario.objects.create(**validated_data)

        for id_carrera in carreras:
            UsuarioCarrera.objects.create(id_usuario=usuario, id_carrera_id=id_carrera)

        if rol_id == 2:
            Docente.objects.create(
                id_usuario=usuario,
                modalidad_contratacion=modalidad,
                tiempo_dedicacion=dedicacion,
            )

        return usuario

    def get_carreras_info(self, obj):
        carreras = obj.usuario_carrera_set.select_related("id_carrera").all()
        return [
            {
                "id_carrera": uc.id_carrera.id_carrera,
                "nombre": uc.id_carrera.nombre,
                "codigo": uc.id_carrera.codigo,
            }
            for uc in carreras
        ]
