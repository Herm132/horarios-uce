from rest_framework import serializers
from apps.usuarios.models import Facultad

class FacultadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facultad
        fields = ['id_facultad', 'nombre']
