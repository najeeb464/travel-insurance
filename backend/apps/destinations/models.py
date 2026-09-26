from django.db import models
from apps.common.models import TimeStampedModel


class Region(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Country(TimeStampedModel):
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True, related_name='countries')
    name = models.CharField(max_length=100, unique=True)
    iso_code = models.CharField(max_length=3, unique=True, help_text="ISO 3166-1 alpha-2 or alpha-3 code")
    currency = models.CharField(max_length=10, default='USD')
    is_schengen = models.BooleanField(default=False)
    risk_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Countries'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.iso_code})"


class Destination(TimeStampedModel):
    class DestinationType(models.TextChoices):
        COUNTRY = 'COUNTRY', 'Country'
        REGION = 'REGION', 'Region'
        WORLDWIDE = 'WORLDWIDE', 'Worldwide'
        SCHENGEN = 'SCHENGEN', 'Schengen Zone'

    name = models.CharField(max_length=150)
    destination_type = models.CharField(max_length=20, choices=DestinationType.choices, default=DestinationType.COUNTRY)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name='destinations')
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True, related_name='destinations')
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-is_popular', 'name']

    def __str__(self):
        return f"{self.name} [{self.destination_type}]"
