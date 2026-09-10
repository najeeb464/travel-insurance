from django.db import models
from apps.common.models import TimeStampedModel


class AgeBracketRule(TimeStampedModel):
    name = models.CharField(max_length=100)
    min_age = models.PositiveIntegerField(default=0)
    max_age = models.PositiveIntegerField(default=120)
    multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['min_age']

    def __str__(self):
        return f"{self.name} ({self.min_age}-{self.max_age} yrs): x{self.multiplier}"


class DurationDiscountRule(TimeStampedModel):
    name = models.CharField(max_length=100)
    min_days = models.PositiveIntegerField()
    max_days = models.PositiveIntegerField(null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['min_days']

    def __str__(self):
        max_str = f"-{self.max_days}" if self.max_days else "+"
        return f"{self.name} ({self.min_days}{max_str} days): {self.discount_percentage}% off"
