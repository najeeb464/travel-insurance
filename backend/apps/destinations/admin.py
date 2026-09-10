from django.contrib import admin
from .models import Region, Country, Destination


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active', 'created_at')
    search_fields = ('name', 'code')


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'iso_code', 'region', 'is_schengen', 'risk_multiplier', 'is_active')
    list_filter = ('is_schengen', 'is_active', 'region')
    search_fields = ('name', 'iso_code')


@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'destination_type', 'country', 'region', 'is_popular', 'is_active')
    list_filter = ('destination_type', 'is_popular', 'is_active')
    search_fields = ('name',)
