from django.urls import path
from .views import PolicyValidateView, PolicyDetailView, PolicyDocumentView, MyPoliciesView

app_name = 'policies'

urlpatterns = [
    path('validate/<str:policy_number>/', PolicyValidateView.as_view(), name='policy_validate'),
    path('my-policies/', MyPoliciesView.as_view(), name='my_policies'),
    path('<str:policy_number>/', PolicyDetailView.as_view(), name='policy_detail'),
    path('<str:policy_number>/document/', PolicyDocumentView.as_view(), name='policy_document'),
]
