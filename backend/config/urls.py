"""
URL configuration for config project.
"""
from pathlib import Path
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Tayara Travel Insurance REST API Root Index
    """
    return Response({
        'name': 'Tayara Travel Insurance API',
        'version': 'v1',
        'status': 'healthy',
        'endpoints': {
            'auth': '/api/v1/auth/',
            'destinations': '/api/v1/destinations/destinations/',
            'regions': '/api/v1/destinations/regions/',
            'countries': '/api/v1/destinations/countries/',
            'products': '/api/v1/products/products/',
            'plans': '/api/v1/products/plans/',
            'coverages': '/api/v1/products/coverages/',
            'travel_types': '/api/v1/products/travel-types/',
            'calculate_quote': '/api/v1/quotes/calculate/',
            'quotes': '/api/v1/quotes/{quote_number}/',
            'orders_create': '/api/v1/orders/create/',
            'orders': '/api/v1/orders/{order_number}/',
            'payments_checkout': '/api/v1/payments/checkout/',
            'payments_webhook': '/api/v1/payments/webhook/',
            'policies': '/api/v1/policies/{policy_number}/',
            'validate_policy': '/api/v1/policies/validate/{policy_number}/',
            'promotions_validate': '/api/v1/promotions/validate/',
            'refunds_request': '/api/v1/refunds/request/',
            'reviews': '/api/v1/reviews/',
            'cms_pages': '/api/v1/cms/pages/',
            'cms_faqs': '/api/v1/cms/faqs/',
            'cms_articles': '/api/v1/cms/articles/',
        }
    })



api_patterns = [
    path('', api_root, name='api_root_sub'),
    path('auth/', include('apps.accounts.urls')),
    path('destinations/', include('apps.destinations.urls')),
    path('products/', include('apps.products.urls')),
    path('promotions/', include('apps.promotions.urls')),
    path('quotes/', include('apps.quotations.urls')),
    path('orders/', include('apps.orders.urls')),
    path('payments/', include('apps.payments.urls')),
    path('policies/', include('apps.policies.urls')),
    path('refunds/', include('apps.refunds.urls')),
    path('reviews/', include('apps.reviews.urls')),
    path('cms/', include('apps.cms.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api_root, name='api_root_base'),

    # Direct v1 paths (when cPanel mounts app at /api)
    path('v1/', api_root, name='api_root_v1'),
    path('v1/', include(api_patterns)),

    # Standard api/v1 paths (for local dev or root deployments)
    path('api/v1/', api_root, name='api_root'),
    path('api/v1/', include(api_patterns)),

    # Static & Media file serving for Django Admin & API (supports both /static/ and /api/static/)
    re_path(r'^(?:api/)?static/(?P<path>.*)$', serve, {'document_root': str(settings.STATIC_ROOT)}),
    re_path(r'^(?:api/)?media/(?P<path>.*)$', serve, {'document_root': str(settings.MEDIA_ROOT)}),
]
