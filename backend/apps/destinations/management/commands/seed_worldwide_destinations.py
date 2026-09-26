from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.destinations.models import Region, Country, Destination


class Command(BaseCommand):
    help = 'Enriches database with all worldwide regions, countries, and destinations.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding comprehensive worldwide regions, countries, and destinations..."))

        # 1. Regions
        regions_data = [
            {'code': 'EUR', 'name': 'Europe', 'description': 'Schengen zone, UK, Ireland, and greater European continent'},
            {'code': 'ASI', 'name': 'Asia', 'description': 'East, Southeast, South, and Central Asia'},
            {'code': 'AME', 'name': 'Americas', 'description': 'North, Central, and South America and the Caribbean'},
            {'code': 'MEA', 'name': 'Middle East & Africa', 'description': 'Gulf Cooperation Council (GCC), Levant, North and Sub-Saharan Africa'},
            {'code': 'OCE', 'name': 'Oceania', 'description': 'Australia, New Zealand, and Pacific Island nations'},
            {'code': 'WLD', 'name': 'Worldwide', 'description': 'All destinations globally'},
        ]

        regions = {}
        for r_data in regions_data:
            region, _ = Region.objects.update_or_create(
                code=r_data['code'],
                defaults={'name': r_data['name'], 'description': r_data['description'], 'is_active': True}
            )
            regions[r_data['code']] = region

        # 2. Worldwide Countries Data
        # (name, iso_code, region_code, is_schengen, risk_multiplier, is_popular)
        countries_catalog = [
            # --- Europe (Schengen 29 States) ---
            ('Austria', 'AT', 'EUR', True, Decimal('1.00'), True),
            ('Belgium', 'BE', 'EUR', True, Decimal('1.00'), False),
            ('Bulgaria', 'BG', 'EUR', True, Decimal('1.00'), False),
            ('Croatia', 'HR', 'EUR', True, Decimal('1.00'), True),
            ('Czech Republic', 'CZ', 'EUR', True, Decimal('1.00'), True),
            ('Denmark', 'DK', 'EUR', True, Decimal('1.05'), False),
            ('Estonia', 'EE', 'EUR', True, Decimal('1.00'), False),
            ('Finland', 'FI', 'EUR', True, Decimal('1.05'), False),
            ('France', 'FR', 'EUR', True, Decimal('1.00'), True),
            ('Germany', 'DE', 'EUR', True, Decimal('1.00'), True),
            ('Greece', 'GR', 'EUR', True, Decimal('1.00'), True),
            ('Hungary', 'HU', 'EUR', True, Decimal('1.00'), False),
            ('Iceland', 'IS', 'EUR', True, Decimal('1.10'), True),
            ('Italy', 'IT', 'EUR', True, Decimal('1.00'), True),
            ('Latvia', 'LV', 'EUR', True, Decimal('1.00'), False),
            ('Liechtenstein', 'LI', 'EUR', True, Decimal('1.10'), False),
            ('Lithuania', 'LT', 'EUR', True, Decimal('1.00'), False),
            ('Luxembourg', 'LU', 'EUR', True, Decimal('1.05'), False),
            ('Malta', 'MT', 'EUR', True, Decimal('1.00'), False),
            ('Netherlands', 'NL', 'EUR', True, Decimal('1.00'), True),
            ('Norway', 'NO', 'EUR', True, Decimal('1.10'), True),
            ('Poland', 'PL', 'EUR', True, Decimal('1.00'), False),
            ('Portugal', 'PT', 'EUR', True, Decimal('1.00'), True),
            ('Romania', 'RO', 'EUR', True, Decimal('1.00'), False),
            ('Slovakia', 'SK', 'EUR', True, Decimal('1.00'), False),
            ('Slovenia', 'SI', 'EUR', True, Decimal('1.00'), False),
            ('Spain', 'ES', 'EUR', True, Decimal('1.00'), True),
            ('Sweden', 'SE', 'EUR', True, Decimal('1.05'), False),
            ('Switzerland', 'CH', 'EUR', True, Decimal('1.10'), True),

            # --- Europe (Non-Schengen) ---
            ('Albania', 'AL', 'EUR', False, Decimal('1.00'), False),
            ('Andorra', 'AD', 'EUR', False, Decimal('1.00'), False),
            ('Armenia', 'AM', 'EUR', False, Decimal('1.05'), False),
            ('Azerbaijan', 'AZ', 'EUR', False, Decimal('1.05'), True),
            ('Belarus', 'BY', 'EUR', False, Decimal('1.10'), False),
            ('Bosnia and Herzegovina', 'BA', 'EUR', False, Decimal('1.00'), False),
            ('Cyprus', 'CY', 'EUR', False, Decimal('1.00'), False),
            ('Georgia', 'GE', 'EUR', False, Decimal('1.05'), True),
            ('Ireland', 'IE', 'EUR', False, Decimal('1.05'), True),
            ('Kosovo', 'XK', 'EUR', False, Decimal('1.00'), False),
            ('Moldova', 'MD', 'EUR', False, Decimal('1.05'), False),
            ('Monaco', 'MC', 'EUR', False, Decimal('1.10'), False),
            ('Montenegro', 'ME', 'EUR', False, Decimal('1.00'), False),
            ('North Macedonia', 'MK', 'EUR', False, Decimal('1.00'), False),
            ('San Marino', 'SM', 'EUR', False, Decimal('1.00'), False),
            ('Serbia', 'RS', 'EUR', False, Decimal('1.00'), False),
            ('Turkey', 'TR', 'EUR', False, Decimal('1.05'), True),
            ('Ukraine', 'UA', 'EUR', False, Decimal('1.20'), False),
            ('United Kingdom', 'GB', 'EUR', False, Decimal('1.15'), True),
            ('Vatican City', 'VA', 'EUR', False, Decimal('1.00'), False),

            # --- Middle East & Gulf (MEA) ---
            ('Bahrain', 'BH', 'MEA', False, Decimal('1.05'), True),
            ('Iraq', 'IQ', 'MEA', False, Decimal('1.20'), False),
            ('Israel', 'IL', 'MEA', False, Decimal('1.15'), False),
            ('Jordan', 'JO', 'MEA', False, Decimal('1.05'), True),
            ('Kuwait', 'KW', 'MEA', False, Decimal('1.05'), True),
            ('Lebanon', 'LB', 'MEA', False, Decimal('1.15'), False),
            ('Oman', 'OM', 'MEA', False, Decimal('1.05'), True),
            ('Palestine', 'PS', 'MEA', False, Decimal('1.20'), False),
            ('Qatar', 'QA', 'MEA', False, Decimal('1.05'), True),
            ('Saudi Arabia', 'SA', 'MEA', False, Decimal('1.05'), True),
            ('Syria', 'SY', 'MEA', False, Decimal('1.30'), False),
            ('United Arab Emirates', 'AE', 'MEA', False, Decimal('1.05'), True),
            ('Yemen', 'YE', 'MEA', False, Decimal('1.30'), False),

            # --- Africa (MEA) ---
            ('Algeria', 'DZ', 'MEA', False, Decimal('1.05'), False),
            ('Angola', 'AO', 'MEA', False, Decimal('1.15'), False),
            ('Benin', 'BJ', 'MEA', False, Decimal('1.10'), False),
            ('Botswana', 'BW', 'MEA', False, Decimal('1.10'), False),
            ('Burkina Faso', 'BF', 'MEA', False, Decimal('1.15'), False),
            ('Burundi', 'BI', 'MEA', False, Decimal('1.20'), False),
            ('Cameroon', 'CM', 'MEA', False, Decimal('1.15'), False),
            ('Cape Verde', 'CV', 'MEA', False, Decimal('1.05'), False),
            ('Central African Republic', 'CF', 'MEA', False, Decimal('1.25'), False),
            ('Chad', 'TD', 'MEA', False, Decimal('1.20'), False),
            ('Comoros', 'KM', 'MEA', False, Decimal('1.15'), False),
            ('Congo', 'CG', 'MEA', False, Decimal('1.20'), False),
            ('DR Congo', 'CD', 'MEA', False, Decimal('1.25'), False),
            ('Djibouti', 'DJ', 'MEA', False, Decimal('1.15'), False),
            ('Egypt', 'EG', 'MEA', False, Decimal('1.05'), True),
            ('Equatorial Guinea', 'GQ', 'MEA', False, Decimal('1.20'), False),
            ('Eritrea', 'ER', 'MEA', False, Decimal('1.20'), False),
            ('Eswatini', 'SZ', 'MEA', False, Decimal('1.10'), False),
            ('Ethiopia', 'ET', 'MEA', False, Decimal('1.10'), False),
            ('Gabon', 'GA', 'MEA', False, Decimal('1.15'), False),
            ('Gambia', 'GM', 'MEA', False, Decimal('1.10'), False),
            ('Ghana', 'GH', 'MEA', False, Decimal('1.10'), False),
            ('Guinea', 'GN', 'MEA', False, Decimal('1.15'), False),
            ('Guinea-Bissau', 'GW', 'MEA', False, Decimal('1.20'), False),
            ('Ivory Coast', 'CI', 'MEA', False, Decimal('1.10'), False),
            ('Kenya', 'KE', 'MEA', False, Decimal('1.10'), True),
            ('Lesotho', 'LS', 'MEA', False, Decimal('1.15'), False),
            ('Liberia', 'LR', 'MEA', False, Decimal('1.20'), False),
            ('Libya', 'LY', 'MEA', False, Decimal('1.25'), False),
            ('Madagascar', 'MG', 'MEA', False, Decimal('1.15'), False),
            ('Malawi', 'MW', 'MEA', False, Decimal('1.15'), False),
            ('Mali', 'ML', 'MEA', False, Decimal('1.20'), False),
            ('Mauritania', 'MR', 'MEA', False, Decimal('1.15'), False),
            ('Mauritius', 'MU', 'MEA', False, Decimal('1.05'), True),
            ('Morocco', 'MA', 'MEA', False, Decimal('1.05'), True),
            ('Mozambique', 'MZ', 'MEA', False, Decimal('1.15'), False),
            ('Namibia', 'NA', 'MEA', False, Decimal('1.10'), False),
            ('Niger', 'NE', 'MEA', False, Decimal('1.20'), False),
            ('Nigeria', 'NG', 'MEA', False, Decimal('1.15'), False),
            ('Rwanda', 'RW', 'MEA', False, Decimal('1.10'), False),
            ('Sao Tome and Principe', 'ST', 'MEA', False, Decimal('1.15'), False),
            ('Senegal', 'SN', 'MEA', False, Decimal('1.10'), False),
            ('Seychelles', 'SC', 'MEA', False, Decimal('1.05'), True),
            ('Sierra Leone', 'SL', 'MEA', False, Decimal('1.20'), False),
            ('Somalia', 'SO', 'MEA', False, Decimal('1.30'), False),
            ('South Africa', 'ZA', 'MEA', False, Decimal('1.10'), True),
            ('South Sudan', 'SS', 'MEA', False, Decimal('1.30'), False),
            ('Sudan', 'SD', 'MEA', False, Decimal('1.25'), False),
            ('Tanzania', 'TZ', 'MEA', False, Decimal('1.10'), True),
            ('Togo', 'TG', 'MEA', False, Decimal('1.15'), False),
            ('Tunisia', 'TN', 'MEA', False, Decimal('1.05'), False),
            ('Uganda', 'UG', 'MEA', False, Decimal('1.10'), False),
            ('Zambia', 'ZM', 'MEA', False, Decimal('1.15'), False),
            ('Zimbabwe', 'ZW', 'MEA', False, Decimal('1.15'), False),

            # --- Asia (ASI) ---
            ('Afghanistan', 'AF', 'ASI', False, Decimal('1.30'), False),
            ('Bangladesh', 'BD', 'ASI', False, Decimal('1.05'), False),
            ('Bhutan', 'BT', 'ASI', False, Decimal('1.05'), False),
            ('Brunei', 'BN', 'ASI', False, Decimal('1.05'), False),
            ('Cambodia', 'KH', 'ASI', False, Decimal('1.05'), True),
            ('China', 'CN', 'ASI', False, Decimal('1.15'), True),
            ('Hong Kong', 'HK', 'ASI', False, Decimal('1.10'), True),
            ('India', 'IN', 'ASI', False, Decimal('1.05'), True),
            ('Indonesia', 'ID', 'ASI', False, Decimal('1.05'), True),
            ('Iran', 'IR', 'ASI', False, Decimal('1.15'), False),
            ('Japan', 'JP', 'ASI', False, Decimal('1.15'), True),
            ('Kazakhstan', 'KZ', 'ASI', False, Decimal('1.05'), False),
            ('Kyrgyzstan', 'KG', 'ASI', False, Decimal('1.05'), False),
            ('Laos', 'LA', 'ASI', False, Decimal('1.05'), False),
            ('Macau', 'MO', 'ASI', False, Decimal('1.10'), False),
            ('Malaysia', 'MY', 'ASI', False, Decimal('1.05'), True),
            ('Maldives', 'MV', 'ASI', False, Decimal('1.05'), True),
            ('Mongolia', 'MN', 'ASI', False, Decimal('1.10'), False),
            ('Myanmar', 'MM', 'ASI', False, Decimal('1.15'), False),
            ('Nepal', 'NP', 'ASI', False, Decimal('1.05'), True),
            ('North Korea', 'KP', 'ASI', False, Decimal('1.30'), False),
            ('Pakistan', 'PK', 'ASI', False, Decimal('1.00'), True),
            ('Philippines', 'PH', 'ASI', False, Decimal('1.05'), True),
            ('Singapore', 'SG', 'ASI', False, Decimal('1.10'), True),
            ('South Korea', 'KR', 'ASI', False, Decimal('1.10'), True),
            ('Sri Lanka', 'LK', 'ASI', False, Decimal('1.05'), True),
            ('Taiwan', 'TW', 'ASI', False, Decimal('1.10'), True),
            ('Tajikistan', 'TJ', 'ASI', False, Decimal('1.05'), False),
            ('Thailand', 'TH', 'ASI', False, Decimal('1.05'), True),
            ('Timor-Leste', 'TL', 'ASI', False, Decimal('1.15'), False),
            ('Turkmenistan', 'TM', 'ASI', False, Decimal('1.10'), False),
            ('Uzbekistan', 'UZ', 'ASI', False, Decimal('1.05'), True),
            ('Vietnam', 'VN', 'ASI', False, Decimal('1.05'), True),

            # --- Americas (AME) ---
            ('Antigua and Barbuda', 'AG', 'AME', False, Decimal('1.10'), False),
            ('Argentina', 'AR', 'AME', False, Decimal('1.05'), True),
            ('Bahamas', 'BS', 'AME', False, Decimal('1.15'), True),
            ('Barbados', 'BB', 'AME', False, Decimal('1.10'), False),
            ('Belize', 'BZ', 'AME', False, Decimal('1.10'), False),
            ('Bolivia', 'BO', 'AME', False, Decimal('1.10'), False),
            ('Brazil', 'BR', 'AME', False, Decimal('1.05'), True),
            ('Canada', 'CA', 'AME', False, Decimal('1.35'), True),
            ('Chile', 'CL', 'AME', False, Decimal('1.05'), False),
            ('Colombia', 'CO', 'AME', False, Decimal('1.05'), True),
            ('Costa Rica', 'CR', 'AME', False, Decimal('1.05'), True),
            ('Cuba', 'CU', 'AME', False, Decimal('1.15'), False),
            ('Dominica', 'DM', 'AME', False, Decimal('1.10'), False),
            ('Dominican Republic', 'DO', 'AME', False, Decimal('1.05'), True),
            ('Ecuador', 'EC', 'AME', False, Decimal('1.05'), False),
            ('El Salvador', 'SV', 'AME', False, Decimal('1.10'), False),
            ('Grenada', 'GD', 'AME', False, Decimal('1.10'), False),
            ('Guatemala', 'GT', 'AME', False, Decimal('1.10'), False),
            ('Guyana', 'GY', 'AME', False, Decimal('1.15'), False),
            ('Haiti', 'HT', 'AME', False, Decimal('1.25'), False),
            ('Honduras', 'HN', 'AME', False, Decimal('1.15'), False),
            ('Jamaica', 'JM', 'AME', False, Decimal('1.10'), False),
            ('Mexico', 'MX', 'AME', False, Decimal('1.10'), True),
            ('Nicaragua', 'NI', 'AME', False, Decimal('1.15'), False),
            ('Panama', 'PA', 'AME', False, Decimal('1.05'), False),
            ('Paraguay', 'PY', 'AME', False, Decimal('1.05'), False),
            ('Peru', 'PE', 'AME', False, Decimal('1.05'), True),
            ('Saint Kitts and Nevis', 'KN', 'AME', False, Decimal('1.10'), False),
            ('Saint Lucia', 'LC', 'AME', False, Decimal('1.10'), False),
            ('Saint Vincent and the Grenadines', 'VC', 'AME', False, Decimal('1.10'), False),
            ('Suriname', 'SR', 'AME', False, Decimal('1.15'), False),
            ('Trinidad and Tobago', 'TT', 'AME', False, Decimal('1.10'), False),
            ('United States', 'US', 'AME', False, Decimal('1.40'), True),
            ('Uruguay', 'UY', 'AME', False, Decimal('1.05'), False),
            ('Venezuela', 'VE', 'AME', False, Decimal('1.25'), False),

            # --- Oceania (OCE) ---
            ('Australia', 'AU', 'OCE', False, Decimal('1.20'), True),
            ('Fiji', 'FJ', 'OCE', False, Decimal('1.10'), True),
            ('Kiribati', 'KI', 'OCE', False, Decimal('1.20'), False),
            ('Marshall Islands', 'MH', 'OCE', False, Decimal('1.20'), False),
            ('Micronesia', 'FM', 'OCE', False, Decimal('1.20'), False),
            ('Nauru', 'NR', 'OCE', False, Decimal('1.20'), False),
            ('New Zealand', 'NZ', 'OCE', False, Decimal('1.15'), True),
            ('Palau', 'PW', 'OCE', False, Decimal('1.15'), False),
            ('Papua New Guinea', 'PG', 'OCE', False, Decimal('1.25'), False),
            ('Samoa', 'WS', 'OCE', False, Decimal('1.15'), False),
            ('Solomon Islands', 'SB', 'OCE', False, Decimal('1.20'), False),
            ('Tonga', 'TO', 'OCE', False, Decimal('1.15'), False),
            ('Tuvalu', 'TV', 'OCE', False, Decimal('1.25'), False),
            ('Vanuatu', 'VU', 'OCE', False, Decimal('1.15'), False),
        ]

        created_countries_count = 0
        updated_countries_count = 0
        country_objects = {}

        for name, iso, reg_code, is_schengen, risk_mult, is_pop in countries_catalog:
            country, created = Country.objects.update_or_create(
                iso_code=iso,
                defaults={
                    'name': name,
                    'region': regions.get(reg_code),
                    'is_schengen': is_schengen,
                    'risk_multiplier': risk_mult,
                    'currency': 'USD',
                    'is_active': True,
                }
            )
            country_objects[iso] = (country, is_pop)
            if created:
                created_countries_count += 1
            else:
                updated_countries_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Processed {len(countries_catalog)} countries: {created_countries_count} created, {updated_countries_count} updated."
        ))

        # 3. Umbrella / Multi-Country Group Destinations
        group_destinations = [
            {
                'name': 'Worldwide (all countries)',
                'destination_type': Destination.DestinationType.WORLDWIDE,
                'region': regions['WLD'],
                'country': None,
                'is_popular': True,
            },
            {
                'name': 'Schengen Zone (all 29 member states)',
                'destination_type': Destination.DestinationType.SCHENGEN,
                'region': regions['EUR'],
                'country': None,
                'is_popular': True,
            },
            {
                'name': 'Europe (entire continent)',
                'destination_type': Destination.DestinationType.REGION,
                'region': regions['EUR'],
                'country': None,
                'is_popular': True,
            },
            {
                'name': 'Gulf Cooperation Council (GCC / Middle East)',
                'destination_type': Destination.DestinationType.REGION,
                'region': regions['MEA'],
                'country': None,
                'is_popular': True,
            },
            {
                'name': 'Asia & Pacific (all countries)',
                'destination_type': Destination.DestinationType.REGION,
                'region': regions['ASI'],
                'country': None,
                'is_popular': True,
            },
            {
                'name': 'Americas (North & South)',
                'destination_type': Destination.DestinationType.REGION,
                'region': regions['AME'],
                'country': None,
                'is_popular': True,
            },
        ]

        for g_data in group_destinations:
            Destination.objects.update_or_create(
                name=g_data['name'],
                defaults={
                    'destination_type': g_data['destination_type'],
                    'region': g_data['region'],
                    'country': g_data['country'],
                    'is_popular': g_data['is_popular'],
                    'is_active': True,
                }
            )

        # 4. Individual Country Destinations
        created_dest_count = 0
        updated_dest_count = 0

        for iso, (country, is_pop) in country_objects.items():
            dest, created = Destination.objects.update_or_create(
                name=country.name,
                country=country,
                defaults={
                    'destination_type': Destination.DestinationType.COUNTRY,
                    'region': country.region,
                    'is_popular': is_pop,
                    'is_active': True,
                }
            )
            if created:
                created_dest_count += 1
            else:
                updated_dest_count += 1

        total_destinations = Destination.objects.filter(is_active=True).count()
        total_countries = Country.objects.filter(is_active=True).count()
        total_regions = Region.objects.filter(is_active=True).count()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully enriched database:\n"
            f" - Regions: {total_regions}\n"
            f" - Countries: {total_countries}\n"
            f" - Destinations: {total_destinations} (including regional groups and worldwide)"
        ))
