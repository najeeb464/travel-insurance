from django.urls import path
from .views import CreateOrderView, OrderDetailView, MyOrdersView, CancelOrderView

app_name = 'orders'

urlpatterns = [
    path('create/', CreateOrderView.as_view(), name='create_order'),
    path('my-orders/', MyOrdersView.as_view(), name='my_orders'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/cancel/', CancelOrderView.as_view(), name='order_cancel'),
]
