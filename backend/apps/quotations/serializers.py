from rest_framework import serializers
from .models import Quote, QuoteTraveler, QuoteSelectedAddon
from apps.destinations.serializers import DestinationSerializer
from apps.products.serializers import PlanSerializer, TravelTypeSerializer


class QuoteTravelerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteTraveler
        fields = ['id', 'traveler_number', 'age', 'daily_rate', 'total_amount']


class QuoteSelectedAddonSerializer(serializers.ModelSerializer):
    addon_name = serializers.CharField(source='plan_coverage.coverage.name', read_only=True)

    class Meta:
        model = QuoteSelectedAddon
        fields = ['id', 'plan_coverage', 'addon_name', 'price']


class QuoteSerializer(serializers.ModelSerializer):
    travelers = QuoteTravelerSerializer(many=True, read_only=True)
    selected_addons = QuoteSelectedAddonSerializer(many=True, read_only=True)
    destination_details = DestinationSerializer(source='destination', read_only=True)
    plan_details = PlanSerializer(source='plan', read_only=True)
    travel_type_details = TravelTypeSerializer(source='travel_type', read_only=True)

    class Meta:
        model = Quote
        fields = [
            'id',
            'quote_number',
            'customer',
            'destination',
            'destination_details',
            'start_date',
            'end_date',
            'travel_type',
            'travel_type_details',
            'plan',
            'plan_details',
            'currency',
            'subtotal',
            'discount',
            'total',
            'status',
            'breakdown_data',
            'promo_code_used',
            'expires_at',
            'travelers',
            'selected_addons',
            'created_at',
        ]


class CalculateQuoteRequestSerializer(serializers.Serializer):
    destination_id = serializers.UUIDField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    travel_type_id = serializers.UUIDField(required=False, allow_null=True)
    travelers_ages = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=120),
        min_length=1,
        default=[30]
    )
    plan_id = serializers.UUIDField(required=False, allow_null=True)
    selected_addon_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=[]
    )
    promo_code = serializers.CharField(required=False, allow_blank=True, max_length=50)

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("start_date cannot be after end_date.")
        return data
