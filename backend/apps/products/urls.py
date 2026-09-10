from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, PlanViewSet, CoverageViewSet, TravelTypeViewSet

app_name = 'products'

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'coverages', CoverageViewSet, basename='coverage')
router.register(r'travel-types', TravelTypeViewSet, basename='travel-type')

urlpatterns = [
    path('', include(router.urls)),
]
