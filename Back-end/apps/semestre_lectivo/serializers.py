from rest_framework import serializers
from apps.usuarios.models import SemestreLectivo


class SemestreLectivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SemestreLectivo
        fields = "__all__"
