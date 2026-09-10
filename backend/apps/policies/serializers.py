from rest_framework import serializers
from .models import Policy


class PolicySerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    currency = serializers.CharField(source='order.currency', read_only=True)
    premium = serializers.DecimalField(source='order.total', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Policy
        fields = [
            'id',
            'policy_number',
            'order',
            'order_number',
            'provider_policy_id',
            'start_date',
            'end_date',
            'destination_name',
            'plan_name',
            'medical_limit',
            'status',
            'certificate_data',
            'currency',
            'premium',
            'issued_at',
        ]


class PolicyValidationSerializer(serializers.Serializer):
    valid = serializers.BooleanField()
    policy_number = serializers.CharField()
    status = serializers.CharField()
    territory = serializers.CharField()
    plan_name = serializers.CharField()
    valid_from = serializers.DateField()
    valid_until = serializers.DateField()
    is_active_today = serializers.BooleanField()
    travelers_count = serializers.IntegerField()
    insured_persons = serializers.ListField(child=serializers.CharField())
    message = serializers.CharField()
