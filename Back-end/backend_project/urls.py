from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # Rutas de autenticación
    path("api/usuarios/", include("apps.usuarios.urls")),
    path("api/superadmin/", include("apps.facultades.urls")),
    path("api/superadmin/", include("apps.carreras.urls")),
    path("api/superadmin/", include("apps.asignaturas.urls")),
    path("api/superadmin/", include("apps.asignatura_carrera.urls")),
    path("api/superadmin/", include("apps.aulas.urls")),
    path("api/superadmin/", include("apps.hora_clase.urls")),
    path("api/superadmin/", include("apps.usuario_carrera.urls")),
    path("api/superadmin/", include("apps.usuario_asignatura.urls")),
    path("api/superadmin/", include("apps.usuario_asignatura_estudiante.urls")),
    path("api/superadmin/", include("apps.horario.urls")),
    path("api/superadmin/", include("apps.semestre_lectivo.urls")),
]
