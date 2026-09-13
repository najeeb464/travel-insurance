from django.urls import path
from .views import CreateOrderView, OrderDetailView, MyOrdersView, CancelOrderView
from .admin_views import AdminStatisticsView, AdminRefundActionView

app_name = 'orders'

urlpatterns = [
    path('admin-stats/', AdminStatisticsView.as_view(), name='admin_stats'),
    path('admin-refunds/<str:pk>/action/', AdminRefundActionView.as_view(), name='admin_refund_action'),
    path('create/', CreateOrderView.as_view(), name='create_order'),
    path('my-orders/', MyOrdersView.as_view(), name='my_orders'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/cancel/', CancelOrderView.as_view(), name='order_cancel'),
]
