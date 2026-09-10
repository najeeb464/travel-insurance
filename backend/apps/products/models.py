from django.db import models
from apps.common.models import TimeStampedModel


class Product(TimeStampedModel):
    class ProductType(models.TextChoices):
        TRAVEL = 'TRAVEL', 'Travel Insurance'
        VISA = 'VISA', 'Visa & Schengen Insurance'
        SPORTS = 'SPORTS', 'Sports & Extreme Activities'
        ANNUAL = 'ANNUAL', 'Multi-Trip Annual Insurance'
        FAMILY = 'FAMILY', 'Family Travel Insurance'

    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    product_type = models.CharField(max_length=20, choices=ProductType.choices, default=ProductType.TRAVEL)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Plan(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='plans')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    base_price_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=1.50)
    currency = models.CharField(max_length=10, default='EUR')
    medical_limit_display = models.CharField(max_length=50, default='€30,000')
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'base_price_per_day']

    def __str__(self):
        return f"{self.product.name} - {self.name} ({self.code})"


class Coverage(TimeStampedModel):
    class Category(models.TextChoices):
        MEDICAL = 'MEDICAL', 'Medical & Health'
        BAGGAGE = 'BAGGAGE', 'Baggage & Belongings'
        FLIGHT = 'FLIGHT', 'Flight & Trip Delay'
        COVID = 'COVID', 'COVID-19 Protection'
        SPORTS = 'SPORTS', 'Sports & Activities'
        LEGAL = 'LEGAL', 'Legal & Liability'
        ASSISTANCE = 'ASSISTANCE', 'Emergency Assistance'

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.MEDICAL)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="UI icon identifier")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} [{self.get_category_display()}]"


class PlanCoverage(TimeStampedModel):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='coverages')
    coverage = models.ForeignKey(Coverage, on_delete=models.CASCADE, related_name='plan_coverages')
    limit_display = models.CharField(max_length=100, help_text="e.g. €30,000 or Included")
    limit_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deductible_display = models.CharField(max_length=50, default="€0", help_text="e.g. €0 or €50")
    is_included = models.BooleanField(default=True)
    is_optional_addon = models.BooleanField(default=False)
    addon_price_per_day = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('plan', 'coverage')
        ordering = ['plan', 'coverage__category', 'coverage__name']

    def __str__(self):
        return f"{self.plan.name} - {self.coverage.name}: {self.limit_display}"


class TravelType(TimeStampedModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    risk_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['risk_multiplier']

    def __str__(self):
        return f"{self.name} (x{self.risk_multiplier})"


class PlanTravelType(TimeStampedModel):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='travel_types')
    travel_type = models.ForeignKey(TravelType, on_delete=models.CASCADE, related_name='plan_travel_types')
    surcharge_per_day = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('plan', 'travel_type')

    def __str__(self):
        return f"{self.plan.name} - {self.travel_type.name} (+€{self.surcharge_per_day}/day)"
