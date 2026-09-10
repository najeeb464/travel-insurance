from django.contrib import admin
from .models import Order
from apps.travelers.models import Traveler


class TravelerInline(admin.TabularInline):
    model = Traveler
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'contact_full_name', 'contact_email', 'total', 'currency', 'status', 'created_at')
    list_filter = ('status', 'currency')
    search_fields = ('order_number', 'contact_email', 'contact_full_name')
    inlines = [TravelerInline]
