from django.db import models
from django.utils import timezone
from apps.common.models import TimeStampedModel


class Page(TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class FAQ(TimeStampedModel):
    class Category(models.TextChoices):
        GENERAL = 'GENERAL', 'General Questions'
        COVERAGE = 'COVERAGE', 'Insurance & Coverage'
        PURCHASE = 'PURCHASE', 'Ordering & Payment'
        POLICY = 'POLICY', 'Policy & Documents'
        REFUND = 'REFUND', 'Refunds & Cancellations'

    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    question = models.CharField(max_length=300)
    answer = models.TextField()
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        ordering = ['category', 'display_order', 'id']

    def __str__(self):
        return self.question


class Article(TimeStampedModel):
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=250, unique=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    category = models.CharField(max_length=100, default='Travel Tips')
    read_time_minutes = models.PositiveIntegerField(default=4)
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title
