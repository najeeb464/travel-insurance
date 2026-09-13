from django.urls import path
from .views import CalculateQuoteView, QuoteDetailView, MyQuotesListView

app_name = 'quotations'

urlpatterns = [
    path('calculate/', CalculateQuoteView.as_view(), name='calculate_quote'),
    path('my-quotes/', MyQuotesListView.as_view(), name='my_quotes'),
    path('<str:quote_number>/', QuoteDetailView.as_view(), name='quote_detail'),
]
