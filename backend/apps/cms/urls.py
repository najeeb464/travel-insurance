from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, FAQViewSet, ArticleViewSet

app_name = 'cms'

router = DefaultRouter()
router.register(r'pages', PageViewSet, basename='page')
router.register(r'faqs', FAQViewSet, basename='faq')
router.register(r'articles', ArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),
]
