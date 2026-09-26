from rest_framework import viewsets, permissions, filters
from .models import Region, Country, Destination
from .serializers import RegionSerializer, CountrySerializer, DestinationSerializer


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.filter(is_active=True)
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.filter(is_active=True).select_related('region')
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'iso_code']
    pagination_class = None


class DestinationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Destination.objects.filter(is_active=True).select_related('country', 'region')
    serializer_class = DestinationSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'country__name', 'country__iso_code', 'region__name']
    pagination_class = None
