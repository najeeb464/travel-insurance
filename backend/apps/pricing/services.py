from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from .models import AgeBracketRule, DurationDiscountRule


class PricingEngine:
    @staticmethod
    def get_age_multiplier(age: int) -> Decimal:
        rule = AgeBracketRule.objects.filter(
            is_active=True,
            min_age__lte=age,
            max_age__gte=age
        ).order_by('-multiplier').first()
        return rule.multiplier if rule else Decimal('1.00')

    @staticmethod
    def get_duration_discount(days: int) -> Decimal:
        rules = DurationDiscountRule.objects.filter(is_active=True, min_days__lte=days)
        best_discount = Decimal('0.00')
        for r in rules:
            if r.max_days is None or days <= r.max_days:
                if r.discount_percentage > best_discount:
                    best_discount = r.discount_percentage
        return best_discount

    @classmethod
    def calculate_plan_price(
        cls,
        plan,
        start_date: date,
        end_date: date,
        destination=None,
        travel_type=None,
        travelers_ages=None,
        selected_addons=None,
        promotion=None,
    ) -> dict:
        if travelers_ages is None or len(travelers_ages) == 0:
            travelers_ages = [30]  # default to 1 adult

        # Duration
        days = max(1, (end_date - start_date).days + 1)

        # Destination risk
        dest_multiplier = Decimal('1.00')
        if destination and destination.country:
            dest_multiplier = Decimal(str(destination.country.risk_multiplier))

        # Travel type risk
        travel_type_multiplier = Decimal('1.00')
        if travel_type:
            travel_type_multiplier = Decimal(str(travel_type.risk_multiplier))

        base_daily_rate = Decimal(str(plan.base_price_per_day))

        traveler_breakdowns = []
        travelers_subtotal = Decimal('0.00')

        for idx, age in enumerate(travelers_ages, start=1):
            age_multiplier = cls.get_age_multiplier(age)
            traveler_daily = (base_daily_rate * dest_multiplier * travel_type_multiplier * age_multiplier).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            traveler_total = (traveler_daily * days).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            travelers_subtotal += traveler_total

            traveler_breakdowns.append({
                'traveler_number': idx,
                'age': age,
                'age_multiplier': float(age_multiplier),
                'daily_rate': float(traveler_daily),
                'total_amount': float(traveler_total),
            })

        # Addons
        addons_breakdown = []
        addons_total = Decimal('0.00')
        if selected_addons:
            traveler_count = len(travelers_ages)
            for addon in selected_addons:
                addon_daily = Decimal(str(addon.addon_price_per_day))
                addon_cost = (addon_daily * days * traveler_count).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                addons_total += addon_cost
                addons_breakdown.append({
                    'addon_id': str(addon.id),
                    'name': addon.coverage.name,
                    'price_per_day': float(addon_daily),
                    'total_cost': float(addon_cost),
                })

        subtotal = travelers_subtotal + addons_total

        # Duration discount
        duration_discount_pct = cls.get_duration_discount(days)
        duration_discount_amt = Decimal('0.00')
        if duration_discount_pct > 0:
            duration_discount_amt = (subtotal * (duration_discount_pct / Decimal('100.00'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        discounted_subtotal = max(Decimal('0.00'), subtotal - duration_discount_amt)

        # Promotion discount
        promo_discount_amt = Decimal('0.00')
        promo_info = None
        if promotion and promotion.is_valid_for_amount(discounted_subtotal):
            promo_discount_amt = promotion.calculate_discount(discounted_subtotal)
            promo_info = {
                'code': promotion.code,
                'discount_type': promotion.discount_type,
                'discount_value': float(promotion.discount_value),
                'discount_amount': float(promo_discount_amt),
            }

        total_discount = duration_discount_amt + promo_discount_amt
        final_total = max(Decimal('1.00'), subtotal - total_discount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        return {
            'plan_id': str(plan.id),
            'plan_name': plan.name,
            'plan_code': plan.code,
            'currency': plan.currency,
            'days': days,
            'base_daily_rate': float(base_daily_rate),
            'destination_multiplier': float(dest_multiplier),
            'travel_type_multiplier': float(travel_type_multiplier),
            'travelers_breakdown': traveler_breakdowns,
            'travelers_subtotal': float(travelers_subtotal),
            'addons_breakdown': addons_breakdown,
            'addons_total': float(addons_total),
            'subtotal': float(subtotal),
            'duration_discount_percentage': float(duration_discount_pct),
            'duration_discount_amount': float(duration_discount_amt),
            'promotion': promo_info,
            'promo_discount_amount': float(promo_discount_amt),
            'total_discount': float(total_discount),
            'final_total': float(final_total),
        }
