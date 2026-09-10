from django.db import transaction
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.orders.models import Order
from apps.policies.services import PolicyService
from apps.policies.serializers import PolicySerializer
from .models import Payment
from .serializers import PaymentSerializer, CheckoutRequestSerializer, PaymentWebhookSerializer


class CheckoutView(views.APIView):
    """
    Online checkout endpoint supporting Visa, Mastercard, Apple Pay, PayPal and simulated gateway.
    Immediately verifies order, records transaction, transitions order to PAID, and issues electronic policy.
    """
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = Order.objects.select_for_update().get(order_number=data['order_number'])
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if order.status in [Order.Status.PAID, Order.Status.ISSUED]:
            return Response({'error': 'This order has already been paid and processed.'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status in [Order.Status.CANCELLED, Order.Status.REFUNDED]:
            return Response({'error': f'Order cannot be paid in current status: {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

        transaction_id = Payment.generate_transaction_id()
        simulate_failure = data.get('simulate_failure', False)

        if simulate_failure:
            payment = Payment.objects.create(
                order=order,
                provider=data['provider'],
                transaction_id=transaction_id,
                amount=order.total,
                currency=order.currency,
                status=Payment.Status.FAILED,
                payment_method=data['payment_method'],
                gateway_response={'status': 'declined', 'error': 'Payment declined by test issuer'},
            )
            order.status = Order.Status.FAILED
            order.save(update_fields=['status'])
            return Response({
                'payment': PaymentSerializer(payment).data,
                'message': 'Payment failed / declined',
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Successful payment
        now = timezone.now()
        payment = Payment.objects.create(
            order=order,
            provider=data['provider'],
            transaction_id=transaction_id,
            amount=order.total,
            currency=order.currency,
            status=Payment.Status.SUCCESS,
            payment_method=data['payment_method'],
            gateway_response={
                'status': 'succeeded',
                'authorization_code': f"AUTH-{transaction_id[-6:]}",
                'processed_at': now.isoformat(),
            },
            paid_at=now,
        )

        order.status = Order.Status.PAID
        order.save(update_fields=['status'])

        # Automatic policy issuance
        policy = PolicyService.issue_policy_for_order(order)

        return Response({
            'message': 'Payment successful and policy issued!',
            'payment': PaymentSerializer(payment).data,
            'policy': PolicySerializer(policy).data,
            'order_number': order.order_number,
            'policy_number': policy.policy_number,
        }, status=status.HTTP_200_OK)


class PaymentWebhookView(views.APIView):
    """
    Server-to-server webhook endpoint for payment providers (e.g. Stripe, PayPal, Mastercard).
    """
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = PaymentWebhookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            payment = Payment.objects.select_for_update().get(transaction_id=data['transaction_id'])
        except Payment.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = data['status']
        if new_status == 'SUCCESS':
            payment.status = Payment.Status.SUCCESS
            payment.paid_at = timezone.now()
            payment.gateway_response.update(data.get('metadata', {}))
            payment.save(update_fields=['status', 'paid_at', 'gateway_response'])

            order = payment.order
            order.status = Order.Status.PAID
            order.save(update_fields=['status'])

            policy = PolicyService.issue_policy_for_order(order)
            return Response({'status': 'processed', 'policy_number': policy.policy_number})

        elif new_status == 'FAILED':
            payment.status = Payment.Status.FAILED
            payment.gateway_response.update(data.get('metadata', {}))
            payment.save(update_fields=['status', 'gateway_response'])
            order = payment.order
            order.status = Order.Status.FAILED
            order.save(update_fields=['status'])
            return Response({'status': 'marked_failed'})

        return Response({'status': 'received'})


class PaymentDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, transaction_id):
        try:
            payment = Payment.objects.select_related('order').get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PaymentSerializer(payment).data)
