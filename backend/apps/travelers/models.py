from django.db import models
from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class Traveler(TimeStampedModel):
    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='travelers')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.MALE)
    nationality = models.CharField(max_length=100, default='Pakistan')
    passport_number = models.CharField(max_length=50)
    passport_expiry = models.DateField()
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.passport_number})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
