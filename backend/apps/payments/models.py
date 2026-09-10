import uuid
from django.db import models
from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class Payment(TimeStampedModel):
    class Provider(models.TextChoices):
        STRIPE = 'STRIPE', 'Stripe'
        PAYPAL = 'PAYPAL', 'PayPal'
        MASTERCARD = 'MASTERCARD', 'Mastercard'
        VISA = 'VISA', 'Visa'
        APPLE_PAY = 'APPLE_PAY', 'Apple Pay'
        MOCK = 'MOCK', 'Simulated Gateway'

    class Status(models.TextChoices):
        INITIATED = 'INITIATED', 'Initiated'
        PENDING = 'PENDING', 'Pending'
        AUTHORIZED = 'AUTHORIZED', 'Authorized'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=30, choices=Provider.choices, default=Provider.MOCK)
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='EUR')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)
    payment_method = models.CharField(max_length=50, default='CARD')
    gateway_response = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id} - {self.amount} {self.currency} [{self.status}]"

    @classmethod
    def generate_transaction_id(cls, prefix='TXN'):
        return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
