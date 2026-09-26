from django.urls import path
from .views import (
    CheckoutView,
    PaymentWebhookView,
    PaymentDetailView,
    PayPalConfigView,
    PayPalCreateOrderView,
    PayPalCaptureOrderView,
)

app_name = 'payments'

urlpatterns = [
    path('config/', PayPalConfigView.as_view(), name='payment_config'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('paypal/create-order/', PayPalCreateOrderView.as_view(), name='paypal_create_order'),
    path('paypal/capture-order/', PayPalCaptureOrderView.as_view(), name='paypal_capture_order'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment_webhook'),
    path('<str:transaction_id>/', PaymentDetailView.as_view(), name='payment_detail'),
]

