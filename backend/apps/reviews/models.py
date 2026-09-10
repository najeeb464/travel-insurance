from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from apps.common.models import TimeStampedModel


class Review(TimeStampedModel):
    reviewer_name = models.CharField(max_length=120)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    comment = models.TextField()
    country = models.CharField(max_length=100, default='Germany')
    is_verified = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer_name} - {self.rating}* ({self.country})"
