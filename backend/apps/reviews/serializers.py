from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id',
            'reviewer_name',
            'rating',
            'comment',
            'country',
            'is_verified',
            'created_at',
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']
