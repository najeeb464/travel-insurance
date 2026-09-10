import uuid
from datetime import timedelta
from django.db import models
from django.utils import timezone
from django.conf import settings
from apps.common.models import TimeStampedModel
from apps.destinations.models import Destination
from apps.products.models import Plan, TravelType, PlanCoverage


class Quote(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        CALCULATED = 'CALCULATED', 'Calculated'
        CONVERTED = 'CONVERTED', 'Converted to Order'
        EXPIRED = 'EXPIRED', 'Expired'
        CANCELLED = 'CANCELLED', 'Cancelled'

    quote_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotes'
    )
    destination = models.ForeignKey(Destination, on_delete=models.CASCADE, related_name='quotes')
    start_date = models.DateField()
    end_date = models.DateField()
    travel_type = models.ForeignKey(TravelType, on_delete=models.CASCADE, related_name='quotes')
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='quotes', null=True, blank=True)
    currency = models.CharField(max_length=10, default='EUR')

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CALCULATED)
    breakdown_data = models.JSONField(default=dict, blank=True, help_text="Full pricing breakdown details")
    promo_code_used = models.CharField(max_length=50, blank=True, null=True)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quote_number} - {self.total} {self.currency} [{self.status}]"

    @classmethod
    def generate_quote_number(cls):
        now = timezone.now()
        short_id = uuid.uuid4().hex[:6].upper()
        return f"QT-{now.year}-{short_id}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        if not self.quote_number:
            self.quote_number = self.generate_quote_number()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)


class QuoteTraveler(TimeStampedModel):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='travelers')
    traveler_number = models.PositiveIntegerField()
    age = models.PositiveIntegerField()
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['traveler_number']

    def __str__(self):
        return f"Traveler #{self.traveler_number} (Age {self.age}) for {self.quote.quote_number}"


class QuoteSelectedAddon(TimeStampedModel):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='selected_addons')
    plan_coverage = models.ForeignKey(PlanCoverage, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.plan_coverage.coverage.name} for {self.quote.quote_number}"
