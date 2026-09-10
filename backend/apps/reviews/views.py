from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Auto-verify if authenticated
        is_verified = self.request.user.is_authenticated
        serializer.save(is_verified=is_verified)
