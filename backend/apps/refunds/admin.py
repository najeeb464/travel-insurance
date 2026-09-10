from django.contrib import admin
from .models import RefundRequest


@admin.register(RefundRequest)
class RefundRequestAdmin(admin.ModelAdmin):
    list_display = ('order', 'contact_email', 'requested_amount', 'currency', 'status', 'created_at', 'processed_at')
    list_filter = ('status', 'currency')
    search_fields = ('order__order_number', 'contact_email')
