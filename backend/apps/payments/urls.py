from django.urls import path
from .views import CheckoutView, PaymentWebhookView, PaymentDetailView

app_name = 'payments'

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment_webhook'),
    path('<str:transaction_id>/', PaymentDetailView.as_view(), name='payment_detail'),
]
