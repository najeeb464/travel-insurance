from django.contrib import admin
from .models import AgeBracketRule, DurationDiscountRule


@admin.register(AgeBracketRule)
class AgeBracketRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_age', 'max_age', 'multiplier', 'is_active')
    list_filter = ('is_active',)


@admin.register(DurationDiscountRule)
class DurationDiscountRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_days', 'max_days', 'discount_percentage', 'is_active')
    list_filter = ('is_active',)
