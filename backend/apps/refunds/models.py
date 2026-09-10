from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel
from apps.orders.models import Order


class RefundRequest(TimeStampedModel):
    class Status(models.TextChoices):
        REQUESTED = 'REQUESTED', 'Requested'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refund_requests')
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='refund_requests'
    )
    contact_email = models.EmailField()
    reason = models.TextField()
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='EUR')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    admin_notes = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund for {self.order.order_number} ({self.status})"
