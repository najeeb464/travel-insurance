from rest_framework import serializers
from .models import Region, Country, Destination


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name', 'code', 'description', 'is_active']


class CountrySerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Country
        fields = ['id', 'name', 'iso_code', 'currency', 'is_schengen', 'risk_multiplier', 'region', 'region_name', 'is_active']


class DestinationSerializer(serializers.ModelSerializer):
    country_iso = serializers.CharField(source='country.iso_code', read_only=True)
    country_name = serializers.CharField(source='country.name', read_only=True)
    region_name = serializers.CharField(source='region.name', read_only=True)
    risk_multiplier = serializers.SerializerMethodField()

    class Meta:
        model = Destination
        fields = [
            'id',
            'name',
            'destination_type',
            'country',
            'country_iso',
            'country_name',
            'region',
            'region_name',
            'risk_multiplier',
            'is_popular',
            'is_active',
        ]

    def get_risk_multiplier(self, obj):
        if obj.country:
            return float(obj.country.risk_multiplier)
        return 1.00
