from rest_framework import serializers
from apps.usuarios.models import Asignatura

class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = '__all__'
