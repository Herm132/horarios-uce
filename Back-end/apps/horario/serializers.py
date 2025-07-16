from rest_framework import serializers
from apps.usuarios.models import Horario, Asignatura, Aula, HoraClase, Usuario

# Serializadores anidados para mostrar la info completa
class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ['id_asignatura', 'nombre', 'codigo', 'es_comun']

class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = ['id_aula', 'nombre', 'capacidad', 'uso_general']

class HoraClaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraClase
        fields = ['id_hora_clase', 'dia', 'hora_inicio', 'hora_fin']

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nombres', 'apellidos', 'correo']

class HorarioSerializer(serializers.ModelSerializer):
    asignatura = AsignaturaSerializer(source='id_asignatura', read_only=True)
    aula = AulaSerializer(source='id_aula', read_only=True)
    hora_clase = HoraClaseSerializer(source='id_hora_clase', read_only=True)
    usuario = UsuarioSerializer(source='id_usuario', read_only=True)

    id_asignatura = serializers.PrimaryKeyRelatedField(queryset=Asignatura.objects.all(), write_only=True)
    id_aula = serializers.PrimaryKeyRelatedField(queryset=Aula.objects.all(), write_only=True)
    id_hora_clase = serializers.PrimaryKeyRelatedField(queryset=HoraClase.objects.all(), write_only=True)
    id_usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all(), write_only=True)

    class Meta:
        model = Horario
        fields = [
            'id_horario',
            'id_asignatura', 'asignatura',
            'id_aula', 'aula',
            'id_hora_clase', 'hora_clase',
            'id_usuario', 'usuario',
            'paralelo', 'semestre_lectivo'
        ]

    def validate(self, data):
        # Validaciones de conflictos
        paralelo = data['paralelo']
        id_asignatura = data['id_asignatura']
        id_usuario = data['id_usuario']
        id_aula = data['id_aula']
        id_hora_clase = data['id_hora_clase']

        # Validar conflicto de aula
        if Horario.objects.filter(id_hora_clase=id_hora_clase, id_aula=id_aula).exists():
            raise serializers.ValidationError("El aula ya está ocupada en ese horario.")

        # Validar conflicto del docente
        if Horario.objects.filter(id_hora_clase=id_hora_clase, id_usuario=id_usuario).exists():
            raise serializers.ValidationError("El docente ya tiene una clase asignada en ese horario.")

        # Validar materia común solo en aulas de uso general
        if id_asignatura.es_comun and not id_aula.uso_general:
            raise serializers.ValidationError("Las asignaturas comunes solo pueden ser asignadas a aulas de uso general.")

        return data