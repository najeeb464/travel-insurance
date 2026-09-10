from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'order', 'provider', 'payment_method', 'amount', 'currency', 'status', 'paid_at')
    list_filter = ('provider', 'status', 'payment_method')
    search_fields = ('transaction_id', 'order__order_number')
