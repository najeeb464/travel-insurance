from rest_framework import viewsets, generics, permissions, filters
from .models import Page, FAQ, Article
from .serializers import PageSerializer, FAQSerializer, ArticleSerializer


class PageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Page.objects.filter(is_active=True)
    serializer_class = PageSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True).order_by('category', 'display_order')
    serializer_class = FAQSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['question', 'answer']


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'category']
