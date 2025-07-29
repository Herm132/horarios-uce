from apps.core.models.log_cambios import LogCambio


def registrar_log(
    request, accion, tabla, id_registro, antes=None, despues=None, usuario_manual=None
):
    usuario = (
        usuario_manual
        if usuario_manual
        else (request.user if request.user.is_authenticated else None)
    )

    LogCambio.objects.create(
        usuario=usuario,
        tabla_afectada=tabla,
        accion=accion,
        id_registro=id_registro,
        datos_anteriores=antes,
        datos_nuevos=despues,
    )
