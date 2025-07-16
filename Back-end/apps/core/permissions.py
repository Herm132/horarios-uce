from rest_framework.permissions import BasePermission

#Permite el acceso solo a usuarios con rol SuperAdmin (id_rol = 4).
class IsSuperAdmin(BasePermission):
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and hasattr(request.user, 'id_rol') 
            and request.user.id_rol.id_rol == 4
        )
        
# Acceso solo a Admin
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and hasattr(request.user, 'id_rol') 
            and request.user.id_rol.id_rol == 3
        )

# Acceso a SuperAdmin o Admin
class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and hasattr(request.user, 'id_rol') 
            and request.user.id_rol.id_rol in [3, 4]
        )

# Acceso solo a Docente
class IsDocente(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'id_rol') 
            and request.user.id_rol.id_rol == 2
        )

# Acceso solo a Estudiante
class IsEstudiante(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'id_rol') 
            and request.user.id_rol.id_rol == 1
        )


class IsAnyAuthenticatedUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'id_rol')
            and request.user.id_rol.id_rol in [1, 2, 3, 4]
        )