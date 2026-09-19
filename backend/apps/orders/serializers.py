from rest_framework import serializers
from .models import Order
from apps.travelers.serializers import TravelerSerializer, TravelerCreateSerializer
from apps.quotations.serializers import QuoteSerializer


class OrderSerializer(serializers.ModelSerializer):
    travelers = TravelerSerializer(many=True, read_only=True)
    quote_details = QuoteSerializer(source='quote', read_only=True)
    policy_number = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer',
            'quote',
            'quote_details',
            'contact_email',
            'contact_phone',
            'contact_full_name',
            'currency',
            'subtotal',
            'discount',
            'tax',
            'total',
            'status',
            'order_snapshot',
            'travelers',
            'policy_number',
            'created_at',
        ]
        read_only_fields = ['id', 'order_number', 'status', 'created_at']

    def get_policy_number(self, obj):
        if hasattr(obj, 'policy'):
            return obj.policy.policy_number
        return None


class CreateOrderFromQuoteSerializer(serializers.Serializer):
    quote_number = serializers.CharField(max_length=50)
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(max_length=30)
    contact_full_name = serializers.CharField(max_length=150)
    travelers = TravelerCreateSerializer(many=True)

    def validate_travelers(self, value):
        if not value:
            raise serializers.ValidationError("At least one traveler is required.")
        return value

    def validate_quote_number(self, value):
        from apps.quotations.models import Quote
        try:
            quote = Quote.objects.get(quote_number=value)
        except Quote.DoesNotExist:
            raise serializers.ValidationError("Quote not found.")

        if quote.status == Quote.Status.CONVERTED:
            from apps.orders.models import Order
            pending_order = Order.objects.filter(quote=quote, status=Order.Status.PENDING_PAYMENT).first()
            if not pending_order:
                paid_order = Order.objects.filter(quote=quote, status=Order.Status.PAID).first()
                if paid_order:
                    raise serializers.ValidationError("This quote has already been completed and paid. Please calculate a new quote.")
                raise serializers.ValidationError("This quote has already been converted into an order.")
        if quote.is_expired:
            raise serializers.ValidationError("This quote has expired. Please calculate a new quote.")
        return value
