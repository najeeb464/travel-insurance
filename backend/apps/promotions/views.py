from decimal import Decimal
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Promotion
from .serializers import PromotionSerializer, ValidatePromoSerializer


class ValidatePromoView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ValidatePromoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].strip().upper()
        amount = serializer.validated_data.get('amount', Decimal('0.00'))

        try:
            promo = Promotion.objects.get(code__iexact=code, is_active=True)
        except Promotion.DoesNotExist:
            return Response({'valid': False, 'message': 'Promo code not found or inactive'}, status=status.HTTP_404_NOT_FOUND)

        if not promo.is_valid_for_amount(amount):
            return Response({
                'valid': False,
                'message': f'Promo code is not eligible (minimum order amount is €{promo.min_amount} or limit reached)',
            }, status=status.HTTP_400_BAD_REQUEST)

        discount = promo.calculate_discount(amount)
        return Response({
            'valid': True,
            'code': promo.code,
            'discount_type': promo.discount_type,
            'discount_value': float(promo.discount_value),
            'discount_amount': float(discount),
            'description': promo.description,
        })
