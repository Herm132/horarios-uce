from django.db import models
from apps.usuarios.models import Usuario


class LogCambio(models.Model):
    ACCIONES = (
        ("CREATE", "Crear"),
        ("UPDATE", "Actualizar"),
        ("DELETE", "Eliminar"),
        ("LOGIN", "Inicio de sesión"),
    )

    usuario = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, db_column="usuario_id"
    )
    tabla_afectada = models.CharField(max_length=100)
    accion = models.CharField(max_length=10, choices=ACCIONES)
    id_registro = models.IntegerField()
    datos_anteriores = models.JSONField(null=True, blank=True)
    datos_nuevos = models.JSONField(null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = "log_cambio"
