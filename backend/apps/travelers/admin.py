from django.contrib import admin
from .models import Traveler


@admin.register(Traveler)
class TravelerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'order', 'passport_number', 'nationality', 'date_of_birth', 'is_primary')
    search_fields = ('first_name', 'last_name', 'passport_number', 'order__order_number')
    list_filter = ('nationality', 'gender', 'is_primary')
