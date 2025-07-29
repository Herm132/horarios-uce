from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.forms.models import model_to_dict
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.usuarios.models import Usuario
from apps.core.utils.logger import registrar_log
from .serializers import LoginSerializer, UsuarioSerializer, RegistroSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.validated_data["usuario"]
            refresh = RefreshToken.for_user(usuario)

            registrar_log(
                request,
                "LOGIN",
                "auth",
                usuario.id_usuario,
                despues={"ip": self.get_client_ip(request)},
                usuario_manual=usuario,
            )

            data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "usuario": UsuarioSerializer(usuario).data,
            }
            return Response(data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_client_ip(self, request):
        """Extrae la IP del usuario desde headers o request META."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip


class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()

            # 🔐 Log de creación de usuario
            registrar_log(
                request,
                "CREATE",
                "usuario",
                usuario.id_usuario,
                despues=model_to_dict(usuario),
            )

            return Response(
                {
                    "mensaje": "Usuario creado exitosamente",
                    "usuario": UsuarioSerializer(usuario).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related("id_rol").all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]

    def list(self, request):
        usuarios = self.queryset.prefetch_related("carreras_asociadas__id_carrera")
        resultado = []

        for usuario in usuarios:
            carreras = [
                {
                    "id_carrera": uc.id_carrera.id_carrera,
                    "nombre": uc.id_carrera.nombre,
                    "codigo": uc.id_carrera.codigo,
                }
                for uc in usuario.carreras_asociadas.all()
            ]

            resultado.append(
                {
                    "id_usuario": usuario.id_usuario,
                    "nombres": usuario.nombres,
                    "apellidos": usuario.apellidos,
                    "correo": usuario.correo,
                    "cedula": usuario.cedula,
                    "rol": {
                        "id_rol": usuario.id_rol.id_rol,
                        "nombre_rol": usuario.id_rol.nombre_rol,
                    },
                    "carreras": carreras,
                }
            )

        return Response(resultado)

    def retrieve(self, request, pk=None):
        try:
            usuario = Usuario.objects.prefetch_related(
                "carreras_asociadas__id_carrera"
            ).get(pk=pk)
            serializer = self.get_serializer(usuario)
            return Response(serializer.data)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, pk=None):
        try:
            usuario = Usuario.objects.get(pk=pk)
            datos_antes = model_to_dict(usuario)

            serializer = self.get_serializer(usuario, data=request.data, partial=True)
            if serializer.is_valid():
                usuario = serializer.save()
                datos_despues = model_to_dict(usuario)

                registrar_log(
                    request,
                    "UPDATE",
                    "usuario",
                    usuario.id_usuario,
                    antes=datos_antes,
                    despues=datos_despues,
                )

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        try:
            usuario = Usuario.objects.get(pk=pk)
            datos_antes = model_to_dict(usuario)

            registrar_log(
                request, "DELETE", "usuario", usuario.id_usuario, antes=datos_antes
            )

            usuario.delete()
            return Response(
                {"detail": "Usuario eliminado correctamente."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND
            )
