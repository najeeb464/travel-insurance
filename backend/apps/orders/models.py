import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.common.models import TimeStampedModel
from apps.quotations.models import Quote


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_PAYMENT = 'PENDING_PAYMENT', 'Pending Payment'
        PAYMENT_PROCESSING = 'PAYMENT_PROCESSING', 'Payment Processing'
        PAID = 'PAID', 'Paid'
        POLICY_PENDING = 'POLICY_PENDING', 'Policy Pending'
        ISSUED = 'ISSUED', 'Policy Issued'
        CANCELLED = 'CANCELLED', 'Cancelled'
        REFUNDED = 'REFUNDED', 'Refunded'
        FAILED = 'FAILED', 'Failed'

    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    quote = models.ForeignKey(Quote, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    # Buyer / Contact details (supports guest checkout without forcing account registration)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30)
    contact_full_name = models.CharField(max_length=150)

    currency = models.CharField(max_length=10, default='EUR')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING_PAYMENT)
    order_snapshot = models.JSONField(default=dict, blank=True, help_text="Immutable snapshot of plan, coverage, and quote terms")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.total} {self.currency} [{self.get_status_display()}]"

    @classmethod
    def generate_order_number(cls):
        now = timezone.now()
        short_id = uuid.uuid4().hex[:6].upper()
        return f"ORD-{now.year}-{short_id}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
