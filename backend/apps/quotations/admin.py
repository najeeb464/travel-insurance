from django.contrib import admin
from .models import Quote, QuoteTraveler, QuoteSelectedAddon


class QuoteTravelerInline(admin.TabularInline):
    model = QuoteTraveler
    extra = 0


class QuoteSelectedAddonInline(admin.TabularInline):
    model = QuoteSelectedAddon
    extra = 0


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('quote_number', 'destination', 'plan', 'travel_type', 'total', 'currency', 'status', 'created_at')
    list_filter = ('status', 'travel_type', 'plan')
    search_fields = ('quote_number', 'customer__email')
    inlines = [QuoteTravelerInline, QuoteSelectedAddonInline]
