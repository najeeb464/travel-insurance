from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer_name', 'rating', 'country', 'is_verified', 'is_active', 'created_at')
    list_filter = ('rating', 'is_verified', 'is_active')
    search_fields = ('reviewer_name', 'comment', 'country')
