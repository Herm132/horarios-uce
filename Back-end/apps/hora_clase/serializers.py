from rest_framework import serializers
from apps.usuarios.models import HoraClase

class HoraClaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraClase
        fields = '__all__'