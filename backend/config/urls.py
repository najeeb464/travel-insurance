"""
URL configuration for config project.
"""
from pathlib import Path
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve
from django.views.generic import TemplateView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Tavara Travel Insurance REST API Root Index
    """
    return Response({
        'name': 'Tavara Travel Insurance API',
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


frontend_dist = settings.BASE_DIR / 'frontend' / 'dist'
frontend_assets = frontend_dist / 'assets'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api_root, name='api_root'),
    path('api/v1/auth/', include('apps.accounts.urls', namespace='accounts')),
    path('api/v1/destinations/', include('apps.destinations.urls', namespace='destinations')),
    path('api/v1/products/', include('apps.products.urls', namespace='products')),
    path('api/v1/promotions/', include('apps.promotions.urls', namespace='promotions')),
    path('api/v1/quotes/', include('apps.quotations.urls', namespace='quotations')),
    path('api/v1/orders/', include('apps.orders.urls', namespace='orders')),
    path('api/v1/payments/', include('apps.payments.urls', namespace='payments')),
    path('api/v1/policies/', include('apps.policies.urls', namespace='policies')),
    path('api/v1/refunds/', include('apps.refunds.urls', namespace='refunds')),
    path('api/v1/reviews/', include('apps.reviews.urls', namespace='reviews')),
    path('api/v1/cms/', include('apps.cms.urls', namespace='cms')),
]

if frontend_dist.exists():
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': str(frontend_assets)}),
        re_path(r'^(?!api/|admin/|assets/).*$', TemplateView.as_view(template_name='index.html')),
    ]
