from django.contrib import admin
from .models import Promotion


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'min_amount', 'max_discount', 'times_used', 'is_active')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code',)
