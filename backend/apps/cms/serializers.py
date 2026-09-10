from rest_framework import serializers
from .models import Page, FAQ, Article


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'content', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = FAQ
        fields = ['id', 'category', 'category_display', 'question', 'answer', 'display_order']


class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'excerpt', 'content', 'category', 'read_time_minutes', 'published_at']
