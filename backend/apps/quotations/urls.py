from django.urls import path
from .views import CalculateQuoteView, QuoteDetailView

app_name = 'quotations'

urlpatterns = [
    path('calculate/', CalculateQuoteView.as_view(), name='calculate_quote'),
    path('<str:quote_number>/', QuoteDetailView.as_view(), name='quote_detail'),
]
