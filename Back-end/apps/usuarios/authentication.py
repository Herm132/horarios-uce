from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from apps.usuarios.models import Usuario


class UsuarioJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token["user_id"]
            user = Usuario.objects.get(id_usuario=user_id)
            user.is_authenticated = True
            return user
        except Usuario.DoesNotExist:
            raise AuthenticationFailed("Usuario no encontrado.")
