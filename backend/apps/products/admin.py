from django.contrib import admin
from .models import Product, Plan, Coverage, PlanCoverage, TravelType, PlanTravelType


class PlanCoverageInline(admin.TabularInline):
    model = PlanCoverage
    extra = 1


class PlanTravelTypeInline(admin.TabularInline):
    model = PlanTravelType
    extra = 1


class PlanInline(admin.StackedInline):
    model = Plan
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_type', 'is_active', 'created_at')
    list_filter = ('product_type', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [PlanInline]


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'code', 'base_price_per_day', 'currency', 'medical_limit_display', 'is_popular', 'is_active')
    list_filter = ('product', 'is_popular', 'is_active')
    inlines = [PlanCoverageInline, PlanTravelTypeInline]


@admin.register(Coverage)
class CoverageAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'category', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'code')


@admin.register(TravelType)
class TravelTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'risk_multiplier', 'is_active')
