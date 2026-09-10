from django.contrib import admin
from .models import Policy


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('policy_number', 'order', 'destination_name', 'plan_name', 'status', 'start_date', 'end_date', 'issued_at')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('policy_number', 'order__order_number', 'destination_name')
    readonly_fields = ('policy_number', 'provider_policy_id', 'issued_at')
