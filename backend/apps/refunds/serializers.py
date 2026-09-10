from rest_framework import serializers
from .models import RefundRequest
from apps.orders.models import Order


class RefundRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = RefundRequest
        fields = [
            'id',
            'order',
            'order_number',
            'customer',
            'contact_email',
            'reason',
            'requested_amount',
            'currency',
            'status',
            'admin_notes',
            'processed_at',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'admin_notes', 'processed_at', 'created_at']


class CreateRefundRequestSerializer(serializers.Serializer):
    order_number = serializers.CharField(max_length=50)
    contact_email = serializers.EmailField()
    reason = serializers.CharField(min_length=10)
