from rest_framework import serializers
from .models import Traveler


class TravelerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Traveler
        fields = [
            'id',
            'order',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'nationality',
            'passport_number',
            'passport_expiry',
            'email',
            'phone',
            'is_primary',
        ]
        read_only_fields = ['id', 'order']


class TravelerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Traveler
        fields = [
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'nationality',
            'passport_number',
            'passport_expiry',
            'email',
            'phone',
            'is_primary',
        ]
