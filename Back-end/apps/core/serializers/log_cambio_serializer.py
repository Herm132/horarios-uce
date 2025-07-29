from rest_framework import serializers
from apps.core.models.log_cambios import LogCambio
from apps.usuarios.models import Usuario


class LogCambioSerializer(serializers.ModelSerializer):
    usuario_cedula = serializers.SerializerMethodField()
    usuario_correo = serializers.SerializerMethodField()

    class Meta:
        model = LogCambio
        fields = "__all__"

    def get_usuario_cedula(self, obj):
        try:
            usuario = Usuario.objects.get(pk=obj.usuario_id)
            return usuario.cedula
        except Usuario.DoesNotExist:
            return None

    def get_usuario_correo(self, obj):
        try:
            usuario = Usuario.objects.get(pk=obj.usuario_id)
            return usuario.correo
        except Usuario.DoesNotExist:
            return None

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Reglas personalizadas
        if instance.accion == "DELETE" and instance.datos_nuevos is None:
            data["datos_nuevos"] = "Registro eliminado"

        if instance.accion == "CREATE" and instance.datos_anteriores is None:
            data["datos_anteriores"] = "Registro creado"

        return data
