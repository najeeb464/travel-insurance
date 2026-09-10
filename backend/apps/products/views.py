from rest_framework import viewsets, permissions
from .models import Product, Plan, Coverage, TravelType
from .serializers import ProductSerializer, PlanSerializer, CoverageSerializer, TravelTypeSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).prefetch_related('plans__coverages__coverage', 'plans__travel_types__travel_type')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.filter(is_active=True).select_related('product').prefetch_related('coverages__coverage', 'travel_types__travel_type')
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]


class CoverageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coverage.objects.filter(is_active=True)
    serializer_class = CoverageSerializer
    permission_classes = [permissions.AllowAny]


class TravelTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TravelType.objects.filter(is_active=True)
    serializer_class = TravelTypeSerializer
    permission_classes = [permissions.AllowAny]
