from django.urls import path
from .views import RequestRefundView, MyRefundsView

app_name = 'refunds'

urlpatterns = [
    path('request/', RequestRefundView.as_view(), name='request_refund'),
    path('my-requests/', MyRefundsView.as_view(), name='my_refunds'),
]
