from rest_framework import serializers
from apps.usuarios.models import Carrera

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = ['id_carrera', 'nombre', 'codigo', 'id_facultad']
