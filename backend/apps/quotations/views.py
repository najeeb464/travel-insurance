from rest_framework import views, status, permissions
from rest_framework.response import Response
from apps.destinations.models import Destination
from apps.products.models import Plan, TravelType, PlanCoverage
from apps.promotions.models import Promotion
from apps.pricing.services import PricingEngine
from .models import Quote, QuoteTraveler, QuoteSelectedAddon
from .serializers import QuoteSerializer, CalculateQuoteRequestSerializer


class CalculateQuoteView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CalculateQuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            destination = Destination.objects.get(id=data['destination_id'], is_active=True)
        except Destination.DoesNotExist:
            return Response({'error': 'Destination not found'}, status=status.HTTP_404_NOT_FOUND)

        travel_type = None
        if data.get('travel_type_id'):
            try:
                travel_type = TravelType.objects.get(id=data['travel_type_id'], is_active=True)
            except TravelType.DoesNotExist:
                return Response({'error': 'Travel type not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            travel_type = TravelType.objects.filter(is_active=True).order_by('risk_multiplier').first()

        selected_addons = []
        if data.get('selected_addon_ids'):
            selected_addons = list(PlanCoverage.objects.filter(id__in=data['selected_addon_ids'], is_optional_addon=True))

        promotion = None
        promo_code = data.get('promo_code', '').strip()
        if promo_code:
            promotion = Promotion.objects.filter(code__iexact=promo_code, is_active=True).first()

        # If a specific plan was requested:
        if data.get('plan_id'):
            try:
                plan = Plan.objects.get(id=data['plan_id'], is_active=True)
            except Plan.DoesNotExist:
                return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)

            pricing = PricingEngine.calculate_plan_price(
                plan=plan,
                start_date=data['start_date'],
                end_date=data['end_date'],
                destination=destination,
                travel_type=travel_type,
                travelers_ages=data['travelers_ages'],
                selected_addons=selected_addons,
                promotion=promotion,
            )

            customer = request.user if request.user.is_authenticated else None
            quote = Quote.objects.create(
                customer=customer,
                destination=destination,
                start_date=data['start_date'],
                end_date=data['end_date'],
                travel_type=travel_type,
                plan=plan,
                currency=plan.currency,
                subtotal=pricing['subtotal'],
                discount=pricing['total_discount'],
                total=pricing['final_total'],
                status=Quote.Status.CALCULATED,
                breakdown_data=pricing,
                promo_code_used=promo_code if promo_code else None,
            )

            for b in pricing['travelers_breakdown']:
                QuoteTraveler.objects.create(
                    quote=quote,
                    traveler_number=b['traveler_number'],
                    age=b['age'],
                    daily_rate=b['daily_rate'],
                    total_amount=b['total_amount'],
                )

            for addon in selected_addons:
                cost = next((a['total_cost'] for a in pricing['addons_breakdown'] if a['addon_id'] == str(addon.id)), 0)
                QuoteSelectedAddon.objects.create(
                    quote=quote,
                    plan_coverage=addon,
                    price=cost,
                )

            return Response({
                'quote': QuoteSerializer(quote).data,
                'pricing': pricing,
            }, status=status.HTTP_201_CREATED)

        # Otherwise calculate quotes for all active plans
        plans = Plan.objects.filter(is_active=True).order_by('display_order', 'base_price_per_day')
        plan_quotes = []
        created_quotes = []

        for p in plans:
            pricing = PricingEngine.calculate_plan_price(
                plan=p,
                start_date=data['start_date'],
                end_date=data['end_date'],
                destination=destination,
                travel_type=travel_type,
                travelers_ages=data['travelers_ages'],
                selected_addons=selected_addons,
                promotion=promotion,
            )
            customer = request.user if request.user.is_authenticated else None
            quote = Quote.objects.create(
                customer=customer,
                destination=destination,
                start_date=data['start_date'],
                end_date=data['end_date'],
                travel_type=travel_type,
                plan=p,
                currency=p.currency,
                subtotal=pricing['subtotal'],
                discount=pricing['total_discount'],
                total=pricing['final_total'],
                status=Quote.Status.CALCULATED,
                breakdown_data=pricing,
                promo_code_used=promo_code if promo_code else None,
            )
            for b in pricing['travelers_breakdown']:
                QuoteTraveler.objects.create(
                    quote=quote,
                    traveler_number=b['traveler_number'],
                    age=b['age'],
                    daily_rate=b['daily_rate'],
                    total_amount=b['total_amount'],
                )
            created_quotes.append(quote)
            plan_quotes.append({
                'quote_number': quote.quote_number,
                'quote_id': str(quote.id),
                'plan_id': str(p.id),
                'plan_name': p.name,
                'plan_code': p.code,
                'medical_limit_display': p.medical_limit_display,
                'is_popular': p.is_popular,
                'pricing': pricing,
            })

        return Response({
            'destination': destination.name,
            'start_date': str(data['start_date']),
            'end_date': str(data['end_date']),
            'travelers_count': len(data['travelers_ages']),
            'plan_options': plan_quotes,
        }, status=status.HTTP_200_OK)


class QuoteDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, quote_number):
        try:
            quote = Quote.objects.get(quote_number=quote_number)
        except Quote.DoesNotExist:
            return Response({'error': 'Quote not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(QuoteSerializer(quote).data)
