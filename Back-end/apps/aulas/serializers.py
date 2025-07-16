from rest_framework import serializers
from apps.usuarios.models import Aula

class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = '__all__'
