from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.utils import timezone
from apps.common.models import TimeStampedModel


class Promotion(TimeStampedModel):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage Discount'
        FIXED = 'FIXED', 'Fixed Amount Discount'

    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total usage limit across all orders")
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == self.DiscountType.PERCENTAGE else 'USD'})"

    def is_valid_for_amount(self, amount: Decimal) -> bool:
        if not self.is_active:
            return False
        today = timezone.now().date()
        if self.start_date and today < self.start_date:
            return False
        if self.end_date and today > self.end_date:
            return False
        if self.usage_limit is not None and self.times_used >= self.usage_limit:
            return False
        if amount < self.min_amount:
            return False
        return True

    def calculate_discount(self, amount: Decimal) -> Decimal:
        if not self.is_valid_for_amount(amount):
            return Decimal('0.00')

        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (amount * (self.discount_value / Decimal('100.00'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            discount = self.discount_value

        if self.max_discount is not None and discount > self.max_discount:
            discount = self.max_discount

        return min(discount, amount)
