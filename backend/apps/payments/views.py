from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.orders.models import Order
from apps.policies.services import PolicyService
from apps.policies.serializers import PolicySerializer
from .models import Payment
from .serializers import (
    PaymentSerializer,
    CheckoutRequestSerializer,
    PaymentWebhookSerializer,
    PayPalCreateOrderSerializer,
    PayPalCaptureOrderSerializer,
)
from .paypal import PayPalClient, PayPalError


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


class PayPalConfigView(views.APIView):
    """
    Returns public PayPal configuration (client ID and sandbox/live mode).
    Allows frontend to dynamically initialize the PayPal JS SDK without hardcoding secrets.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        client_id = getattr(settings, 'PAYPAL_CLIENT_ID', '').strip()
        mode = getattr(settings, 'PAYPAL_MODE', 'sandbox').lower()
        return Response({
            'paypal_client_id': client_id,
            'paypal_mode': mode,
            'paypal_enabled': bool(client_id),
            'currency': 'USD',
        })


class PayPalCreateOrderView(views.APIView):
    """
    Server-side endpoint to create a PayPal checkout order using official PayPal REST v2 API.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PayPalCreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data['order_number']

        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status in [Order.Status.PAID, Order.Status.ISSUED]:
            return Response({'error': 'This order has already been paid.'}, status=status.HTTP_400_BAD_REQUEST)

        if order.status in [Order.Status.CANCELLED, Order.Status.REFUNDED]:
            return Response({'error': f'Order cannot be paid in current status: {order.status}'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            paypal_order = PayPalClient.create_order(order)
            return Response({
                'paypal_order_id': paypal_order['id'],
                'order_number': order.order_number,
                'status': paypal_order.get('status', 'CREATED'),
            }, status=status.HTTP_201_CREATED)
        except PayPalError as e:
            return Response({'error': e.message, 'details': e.details}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to create PayPal order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PayPalCaptureOrderView(views.APIView):
    """
    Server-side endpoint to capture an approved PayPal payment.
    Marks Order as PAID and automatically issues the electronic policy certificate.
    """
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = PayPalCaptureOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data['order_number']
        paypal_order_id = serializer.validated_data['paypal_order_id']

        try:
            order = Order.objects.select_for_update().get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        # If already paid and policy issued, return the existing policy
        if order.status in [Order.Status.PAID, Order.Status.ISSUED] and hasattr(order, 'policy'):
            return Response({
                'message': 'Order is already paid and policy is issued.',
                'policy': PolicySerializer(order.policy).data,
                'order_number': order.order_number,
                'policy_number': order.policy.policy_number,
            }, status=status.HTTP_200_OK)

        try:
            capture_data = PayPalClient.capture_order(paypal_order_id)
        except PayPalError as e:
            return Response({'error': e.message, 'details': e.details}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'PayPal capture request error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        capture_status = capture_data.get('status')
        if capture_status != 'COMPLETED':
            return Response({
                'error': f'PayPal payment not completed (status: {capture_status}).',
                'details': capture_data
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Extract capture ID from purchase units
        capture_id = None
        try:
            payments_obj = capture_data['purchase_units'][0]['payments']
            captures = payments_obj.get('captures', [])
            if captures:
                capture_id = captures[0].get('id')
        except (KeyError, IndexError, TypeError):
            pass

        transaction_id = capture_id or f"PP-{paypal_order_id}"
        now = timezone.now()

        payment, _ = Payment.objects.get_or_create(
            transaction_id=transaction_id,
            defaults={
                'order': order,
                'provider': Payment.Provider.PAYPAL,
                'amount': order.total,
                'currency': order.currency,
                'status': Payment.Status.SUCCESS,
                'payment_method': 'PAYPAL',
                'gateway_response': capture_data,
                'paid_at': now,
            }
        )

        order.status = Order.Status.PAID
        order.save(update_fields=['status'])

        # Issue policy
        policy = PolicyService.issue_policy_for_order(order)

        return Response({
            'message': 'Payment successful and policy issued!',
            'payment': PaymentSerializer(payment).data,
            'policy': PolicySerializer(policy).data,
            'order_number': order.order_number,
            'policy_number': policy.policy_number,
        }, status=status.HTTP_200_OK)

