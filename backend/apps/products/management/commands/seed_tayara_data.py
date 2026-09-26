from apps.products.management.commands.seed_ekta_data import Command as SeedCommand


class Command(SeedCommand):
    help = 'Seeds database with realistic Tayara travel insurance products, plans, destinations, rules, FAQs, and reviews.'
