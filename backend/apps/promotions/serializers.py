from decimal import Decimal
from rest_framework import serializers
from .models import Promotion


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'min_amount',
            'max_discount',
            'start_date',
            'end_date',
            'is_active',
        ]


class ValidatePromoSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=Decimal('0.00'))
