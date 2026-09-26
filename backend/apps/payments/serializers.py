from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'order_number',
            'provider',
            'transaction_id',
            'amount',
            'currency',
            'status',
            'payment_method',
            'gateway_response',
            'paid_at',
            'created_at',
        ]
        read_only_fields = ['id', 'transaction_id', 'status', 'gateway_response', 'paid_at', 'created_at']


class CheckoutRequestSerializer(serializers.Serializer):
    order_number = serializers.CharField(max_length=50)
    provider = serializers.ChoiceField(choices=Payment.Provider.choices, default=Payment.Provider.MOCK)
    payment_method = serializers.CharField(max_length=50, default='CARD')
    simulate_failure = serializers.BooleanField(required=False, default=False)


class PaymentWebhookSerializer(serializers.Serializer):
    transaction_id = serializers.CharField(max_length=100)
    status = serializers.ChoiceField(choices=['SUCCESS', 'FAILED', 'REFUNDED'])
    provider = serializers.CharField(required=False, default='WEBHOOK')
    metadata = serializers.DictField(required=False, default=dict)


class PayPalCreateOrderSerializer(serializers.Serializer):
    order_number = serializers.CharField(max_length=50)


class PayPalCaptureOrderSerializer(serializers.Serializer):
    order_number = serializers.CharField(max_length=50)
    paypal_order_id = serializers.CharField(max_length=100)

