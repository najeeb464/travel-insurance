from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.destinations.models import Region, Country, Destination
from apps.products.models import Product, Plan, Coverage, PlanCoverage, TravelType, PlanTravelType
from apps.pricing.models import AgeBracketRule, DurationDiscountRule
from apps.promotions.models import Promotion
from apps.reviews.models import Review
from apps.cms.models import Page, FAQ, Article

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds database with realistic EKTA travel insurance products, plans, destinations, rules, FAQs, and reviews.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting database seed..."))

        # 1. Admin / Demo User
        if not User.objects.filter(email='admin@ektatraveling.com').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@ektatraveling.com',
                password='adminpassword123',
                first_name='Ekta',
                last_name='Admin',
                role=User.Role.ADMIN
            )
            self.stdout.write(self.style.SUCCESS("Created admin user: admin@ektatraveling.com / adminpassword123"))

        # 2. Regions
        regions_data = [
            {'name': 'Europe', 'code': 'EUR', 'description': 'Schengen zone, UK, and greater Europe'},
            {'name': 'Asia', 'code': 'ASI', 'description': 'East, Southeast, and South Asia'},
            {'name': 'Americas', 'code': 'AME', 'description': 'North, Central, and South America'},
            {'name': 'Middle East & Africa', 'code': 'MEA', 'description': 'Gulf countries and African continent'},
            {'name': 'Worldwide', 'code': 'WLD', 'description': 'All destinations globally'},
        ]
        regions = {}
        for rd in regions_data:
            r, _ = Region.objects.get_or_create(code=rd['code'], defaults=rd)
            regions[rd['code']] = r

        # 3. Countries
        countries_data = [
            {'name': 'France', 'iso_code': 'FR', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.00')},
            {'name': 'Germany', 'iso_code': 'DE', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.00')},
            {'name': 'Italy', 'iso_code': 'IT', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.00')},
            {'name': 'Spain', 'iso_code': 'ES', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.00')},
            {'name': 'Switzerland', 'iso_code': 'CH', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.10')},
            {'name': 'Greece', 'iso_code': 'GR', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.00')},
            {'name': 'Poland', 'iso_code': 'PL', 'region': regions['EUR'], 'is_schengen': True, 'risk_multiplier': Decimal('1.00')},
            {'name': 'United Kingdom', 'iso_code': 'GB', 'region': regions['EUR'], 'is_schengen': False, 'risk_multiplier': Decimal('1.15')},
            {'name': 'Turkey', 'iso_code': 'TR', 'region': regions['EUR'], 'is_schengen': False, 'risk_multiplier': Decimal('1.05')},
            {'name': 'United States', 'iso_code': 'US', 'region': regions['AME'], 'is_schengen': False, 'risk_multiplier': Decimal('1.40')},
            {'name': 'Thailand', 'iso_code': 'TH', 'region': regions['ASI'], 'is_schengen': False, 'risk_multiplier': Decimal('1.10')},
            {'name': 'United Arab Emirates', 'iso_code': 'AE', 'region': regions['MEA'], 'is_schengen': False, 'risk_multiplier': Decimal('1.10')},
            {'name': 'Japan', 'iso_code': 'JP', 'region': regions['ASI'], 'is_schengen': False, 'risk_multiplier': Decimal('1.15')},
            {'name': 'Pakistan', 'iso_code': 'PK', 'region': regions['ASI'], 'is_schengen': False, 'risk_multiplier': Decimal('1.00')},
        ]
        countries = {}
        for cd in countries_data:
            c, _ = Country.objects.get_or_create(iso_code=cd['iso_code'], defaults=cd)
            countries[cd['iso_code']] = c

        # 4. Destinations
        Destination.objects.get_or_create(
            name='Worldwide (all countries)',
            defaults={'destination_type': Destination.DestinationType.WORLDWIDE, 'region': regions['WLD'], 'is_popular': True}
        )
        Destination.objects.get_or_create(
            name='Schengen Zone (all member states)',
            defaults={'destination_type': Destination.DestinationType.SCHENGEN, 'region': regions['EUR'], 'is_popular': True}
        )
        Destination.objects.get_or_create(
            name='Europe (entire continent)',
            defaults={'destination_type': Destination.DestinationType.REGION, 'region': regions['EUR'], 'is_popular': True}
        )
        for iso, country in countries.items():
            is_pop = iso in ['FR', 'DE', 'IT', 'ES', 'TR', 'TH', 'US', 'AE']
            Destination.objects.get_or_create(
                name=country.name,
                country=country,
                defaults={'destination_type': Destination.DestinationType.COUNTRY, 'is_popular': is_pop}
            )

        # 5. Products
        travel_product, _ = Product.objects.get_or_create(
            slug='travel-insurance',
            defaults={
                'name': 'Worldwide Travel Insurance',
                'description': 'Comprehensive medical, emergency, and trip cancellation insurance accepted globally and by Schengen consulates.',
                'product_type': Product.ProductType.TRAVEL,
            }
        )
        visa_product, _ = Product.objects.get_or_create(
            slug='schengen-visa-insurance',
            defaults={
                'name': 'Schengen Visa Insurance',
                'description': 'Meets 100% of EU Regulation requirements: €30,000+ medical cover, zero deductible, repatriation guaranteed.',
                'product_type': Product.ProductType.VISA,
            }
        )

        # 6. Plans
        start_plan, _ = Plan.objects.get_or_create(
            code='START',
            defaults={
                'product': travel_product,
                'name': 'Start',
                'description': 'Essential coverage for budget-conscious travelers. Covers unexpected medical emergencies and repatriation.',
                'base_price_per_day': Decimal('1.50'),
                'medical_limit_display': '€30,000',
                'is_popular': False,
                'display_order': 1,
            }
        )
        gold_plan, _ = Plan.objects.get_or_create(
            code='GOLD',
            defaults={
                'product': travel_product,
                'name': 'Gold',
                'description': 'Most popular tariff! Includes comprehensive €50,000 medical protection, baggage loss, and flight delays.',
                'base_price_per_day': Decimal('2.50'),
                'medical_limit_display': '€50,000',
                'is_popular': True,
                'display_order': 2,
            }
        )
        max_plan, _ = Plan.objects.get_or_create(
            code='MAX_PLUS',
            defaults={
                'product': travel_product,
                'name': 'Max+',
                'description': 'Maximum peace of mind with €100,000 coverage, active sports, legal assistance, and high baggage limit.',
                'base_price_per_day': Decimal('4.00'),
                'medical_limit_display': '€100,000',
                'is_popular': False,
                'display_order': 3,
            }
        )

        # 7. Coverages
        coverages_data = [
            {'code': 'MED_TREATMENT', 'name': 'Emergency Medical Treatment', 'category': Coverage.Category.MEDICAL, 'description': 'Inpatient and outpatient medical treatment in accredited clinics', 'icon': 'hospital'},
            {'code': 'MED_EVACUATION', 'name': 'Emergency Medical Evacuation & Repatriation', 'category': Coverage.Category.MEDICAL, 'description': 'Air ambulance, emergency transport, and medical escort repatriation', 'icon': 'ambulance'},
            {'code': 'COVID19', 'name': 'COVID-19 Treatment & Quarantine', 'category': Coverage.Category.COVID, 'description': 'Testing and hospitalization treatment for acute COVID-19', 'icon': 'shield-virus'},
            {'code': 'BAGGAGE', 'name': 'Lost & Delayed Baggage', 'category': Coverage.Category.BAGGAGE, 'description': 'Reimbursement for damaged or lost registered airline baggage', 'icon': 'luggage'},
            {'code': 'FLIGHT_DELAY', 'name': 'Flight Delay & Cancellation', 'category': Coverage.Category.FLIGHT, 'description': 'Compensates meals, hotels, and tickets if flight delayed over 4 hours', 'icon': 'plane-departure'},
            {'code': 'SPORTS_COVER', 'name': 'Active Recreation & Amateur Sports', 'category': Coverage.Category.SPORTS, 'description': 'Covers injuries sustained during skiing, gym, swimming, and cycling', 'icon': 'snowboarding'},
            {'code': 'DENTAL', 'name': 'Emergency Dental Care', 'category': Coverage.Category.MEDICAL, 'description': 'Acute emergency dental pain relief and tooth repair', 'icon': 'tooth'},
            {'code': 'LEGAL_LIABILITY', 'name': 'Legal Assistance & Civil Liability', 'category': Coverage.Category.LEGAL, 'description': 'Lawyer consultation and liability for third-party property damage', 'icon': 'scale-balanced'},
            {'code': 'HOTLINE_24_7', 'name': '24/7 Multilingual Emergency Hotline', 'category': Coverage.Category.ASSISTANCE, 'description': 'Direct coordinator support across all timezones in English, German, and Spanish', 'icon': 'headset'},
        ]
        coverages = {}
        for cd in coverages_data:
            cov, _ = Coverage.objects.get_or_create(code=cd['code'], defaults=cd)
            coverages[cd['code']] = cov

        # 8. Plan Coverages
        plan_mappings = [
            # START
            (start_plan, coverages['MED_TREATMENT'], '€30,000', Decimal('30000.00'), '€0', True, False, Decimal('0.00')),
            (start_plan, coverages['MED_EVACUATION'], '€10,000', Decimal('10000.00'), '€0', True, False, Decimal('0.00')),
            (start_plan, coverages['COVID19'], '€30,000 Included', Decimal('30000.00'), '€0', True, False, Decimal('0.00')),
            (start_plan, coverages['HOTLINE_24_7'], '24/7 Included', None, '€0', True, False, Decimal('0.00')),
            (start_plan, coverages['BAGGAGE'], 'Up to €1,000', Decimal('1000.00'), '€0', False, True, Decimal('0.60')),
            (start_plan, coverages['SPORTS_COVER'], 'Up to €10,000', Decimal('10000.00'), '€0', False, True, Decimal('0.90')),

            # GOLD
            (gold_plan, coverages['MED_TREATMENT'], '€50,000', Decimal('50000.00'), '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['MED_EVACUATION'], '€30,000', Decimal('30000.00'), '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['COVID19'], '€50,000 Included', Decimal('50000.00'), '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['BAGGAGE'], '€1,000 Included', Decimal('1000.00'), '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['FLIGHT_DELAY'], '€300 Included', Decimal('300.00'), '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['DENTAL'], '€300 Included', Decimal('300.00'), '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['HOTLINE_24_7'], '24/7 Included', None, '€0', True, False, Decimal('0.00')),
            (gold_plan, coverages['SPORTS_COVER'], 'Up to €20,000', Decimal('20000.00'), '€0', False, True, Decimal('0.80')),

            # MAX+
            (max_plan, coverages['MED_TREATMENT'], '€100,000', Decimal('100000.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['MED_EVACUATION'], '€50,000', Decimal('50000.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['COVID19'], '€100,000 Included', Decimal('100000.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['BAGGAGE'], '€2,000 Included', Decimal('2000.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['FLIGHT_DELAY'], '€600 Included', Decimal('600.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['SPORTS_COVER'], '€50,000 Included', Decimal('50000.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['DENTAL'], '€500 Included', Decimal('500.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['LEGAL_LIABILITY'], '€25,000 Included', Decimal('25000.00'), '€0', True, False, Decimal('0.00')),
            (max_plan, coverages['HOTLINE_24_7'], 'VIP 24/7 Priority', None, '€0', True, False, Decimal('0.00')),
        ]
        for p, cov, lim_disp, lim_amt, ded_disp, is_inc, is_opt, addon_price in plan_mappings:
            PlanCoverage.objects.get_or_create(
                plan=p,
                coverage=cov,
                defaults={
                    'limit_display': lim_disp,
                    'limit_amount': lim_amt,
                    'deductible_display': ded_disp,
                    'is_included': is_inc,
                    'is_optional_addon': is_opt,
                    'addon_price_per_day': addon_price,
                }
            )

        # 9. Travel Types
        travel_types_data = [
            {'code': 'CALM', 'name': 'Calm / Leisure', 'description': 'Sightseeing, beach relaxation, museums, and business trips', 'risk_multiplier': Decimal('1.00')},
            {'code': 'ACTIVE', 'name': 'Active / Sports', 'description': 'Amateur fitness, cycling, skiing on marked pistes, swimming, surfing', 'risk_multiplier': Decimal('1.50')},
            {'code': 'EXTREME', 'name': 'Extreme / High Risk', 'description': 'Mountaineering, off-piste skiing, scuba diving, skydiving, paragliding', 'risk_multiplier': Decimal('2.50')},
        ]
        for tt in travel_types_data:
            TravelType.objects.get_or_create(code=tt['code'], defaults=tt)

        # 10. Pricing Rules
        age_rules = [
            {'name': 'Infants & Children', 'min_age': 0, 'max_age': 17, 'multiplier': Decimal('0.85')},
            {'name': 'Adults', 'min_age': 18, 'max_age': 64, 'multiplier': Decimal('1.00')},
            {'name': 'Seniors', 'min_age': 65, 'max_age': 74, 'multiplier': Decimal('1.50')},
            {'name': 'Elderly', 'min_age': 75, 'max_age': 100, 'multiplier': Decimal('2.20')},
        ]
        for ar in age_rules:
            AgeBracketRule.objects.get_or_create(name=ar['name'], defaults=ar)

        duration_rules = [
            {'name': 'Short Stay', 'min_days': 1, 'max_days': 14, 'discount_percentage': Decimal('0.00')},
            {'name': 'Medium Stay Discount', 'min_days': 15, 'max_days': 29, 'discount_percentage': Decimal('5.00')},
            {'name': 'Long Stay Discount', 'min_days': 30, 'max_days': 89, 'discount_percentage': Decimal('10.00')},
            {'name': 'Seasonal / Nomad Discount', 'min_days': 90, 'max_days': None, 'discount_percentage': Decimal('20.00')},
        ]
        for dr in duration_rules:
            DurationDiscountRule.objects.get_or_create(name=dr['name'], defaults=dr)

        # 11. Promotions
        promotions_data = [
            {'code': 'EKTA10', 'description': '10% off any travel insurance quote', 'discount_type': Promotion.DiscountType.PERCENTAGE, 'discount_value': Decimal('10.00'), 'min_amount': Decimal('10.00')},
            {'code': 'SUMMER20', 'description': '20% summer holiday special', 'discount_type': Promotion.DiscountType.PERCENTAGE, 'discount_value': Decimal('20.00'), 'min_amount': Decimal('25.00'), 'max_discount': Decimal('50.00')},
            {'code': 'WELCOME5', 'description': '€5 off on first insurance order', 'discount_type': Promotion.DiscountType.FIXED, 'discount_value': Decimal('5.00'), 'min_amount': Decimal('15.00')},
        ]
        for pr in promotions_data:
            Promotion.objects.get_or_create(code=pr['code'], defaults=pr)

        # 12. Reviews
        reviews_data = [
            {'reviewer_name': 'Sarah Jenkins', 'rating': 5, 'country': 'United Kingdom', 'comment': 'Bought policy in 2 minutes for our Spain trip. Embassy accepted it instantly for Schengen requirements!'},
            {'reviewer_name': 'Marco Rossi', 'rating': 5, 'country': 'Italy', 'comment': 'Excellent assistance when my flight in Frankfurt got cancelled. Received rapid support on WhatsApp.'},
            {'reviewer_name': 'Farhan Khan', 'rating': 5, 'country': 'Pakistan', 'comment': 'Very transparent pricing, no hidden charges. Downloaded the electronic PDF policy immediately after payment.'},
            {'reviewer_name': 'Elena Schulz', 'rating': 4, 'country': 'Germany', 'comment': 'Great pricing for active skiing insurance in Austria. Very smooth process.'},
        ]
        for rev in reviews_data:
            Review.objects.get_or_create(reviewer_name=rev['reviewer_name'], defaults=rev)

        # 13. FAQs
        faqs_data = [
            {
                'category': FAQ.Category.GENERAL,
                'question': 'Is EKTA insurance valid for Schengen visa applications?',
                'answer': 'Yes! All EKTA policies fully meet Regulation (EC) No 810/2009 of the European Parliament. They include €30,000+ medical cover, repatriation, and zero deductible across all 29 Schengen states.',
                'display_order': 1,
            },
            {
                'category': FAQ.Category.PURCHASE,
                'question': 'How quickly will I receive my insurance policy?',
                'answer': 'Immediately after successful payment! The electronic insurance certificate and policy document are generated automatically and sent to your email within seconds.',
                'display_order': 2,
            },
            {
                'category': FAQ.Category.POLICY,
                'question': 'How can I or border control verify my policy authenticity?',
                'answer': 'You can verify any policy at any time using our public verification tool at /api/v1/policies/validate/{policy_number} or by scanning the QR code on your policy certificate.',
                'display_order': 3,
            },
            {
                'category': FAQ.Category.COVERAGE,
                'question': 'Does the policy cover COVID-19?',
                'answer': 'Yes, all our plans (Start, Gold, Max+) cover diagnostic testing, outpatient care, and inpatient hospitalization associated with acute COVID-19 infection.',
                'display_order': 4,
            },
            {
                'category': FAQ.Category.REFUND,
                'question': 'Can I cancel my policy and get a refund?',
                'answer': 'Yes. You can request a refund prior to the policy start date directly via our online refund request form.',
                'display_order': 5,
            },
        ]
        for f in faqs_data:
            FAQ.objects.get_or_create(question=f['question'], defaults=f)

        # 14. CMS Pages
        pages_data = [
            {
                'title': 'About EKTA Traveling',
                'slug': 'about-us',
                'content': 'EKTA Traveling is an innovative travel insurance platform delivering instant digital insurance policies globally since 2020. Our electronic certificates are backed by international underwriters and accepted by embassies worldwide.',
            },
            {
                'title': 'Terms & Conditions',
                'slug': 'terms',
                'content': 'Comprehensive terms and conditions of travel insurance contract, liability exclusions, claim reporting deadlines, and policyholder rights.',
            },
            {
                'title': 'Privacy Policy',
                'slug': 'privacy-policy',
                'content': 'Information on GDPR compliance, encryption standards, data protection, and secure payment handling.',
            },
            {
                'title': 'Refund Policy',
                'slug': 'refund-policy',
                'content': 'Full refund is granted if cancellation is requested prior to the start of the insurance coverage period.',
            },
        ]
        for p in pages_data:
            Page.objects.get_or_create(slug=p['slug'], defaults=p)

        self.stdout.write(self.style.SUCCESS("Successfully seeded all EKTA travel insurance initial data!"))
