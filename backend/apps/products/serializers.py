from rest_framework import serializers
from .models import Product, Plan, Coverage, PlanCoverage, TravelType, PlanTravelType


class CoverageSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Coverage
        fields = ['id', 'name', 'code', 'category', 'category_display', 'description', 'icon', 'is_active']


class PlanCoverageSerializer(serializers.ModelSerializer):
    coverage_name = serializers.CharField(source='coverage.name', read_only=True)
    coverage_code = serializers.CharField(source='coverage.code', read_only=True)
    category = serializers.CharField(source='coverage.category', read_only=True)
    category_display = serializers.CharField(source='coverage.get_category_display', read_only=True)
    icon = serializers.CharField(source='coverage.icon', read_only=True)

    class Meta:
        model = PlanCoverage
        fields = [
            'id',
            'coverage',
            'coverage_name',
            'coverage_code',
            'category',
            'category_display',
            'icon',
            'limit_display',
            'limit_amount',
            'deductible_display',
            'is_included',
            'is_optional_addon',
            'addon_price_per_day',
        ]


class TravelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelType
        fields = ['id', 'name', 'code', 'description', 'risk_multiplier', 'is_active']


class PlanTravelTypeSerializer(serializers.ModelSerializer):
    travel_type_name = serializers.CharField(source='travel_type.name', read_only=True)
    travel_type_code = serializers.CharField(source='travel_type.code', read_only=True)

    class Meta:
        model = PlanTravelType
        fields = ['id', 'travel_type', 'travel_type_name', 'travel_type_code', 'surcharge_per_day']


class PlanSerializer(serializers.ModelSerializer):
    coverages = PlanCoverageSerializer(many=True, read_only=True)
    travel_types = PlanTravelTypeSerializer(many=True, read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Plan
        fields = [
            'id',
            'product',
            'product_name',
            'name',
            'code',
            'description',
            'base_price_per_day',
            'currency',
            'medical_limit_display',
            'is_popular',
            'display_order',
            'coverages',
            'travel_types',
            'is_active',
        ]


class ProductSerializer(serializers.ModelSerializer):
    plans = PlanSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'product_type', 'is_active', 'plans']
