from rest_framework import generics, permissions, status, serializers, exceptions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, CustomerProfile
from .serializers import UserSerializer, RegisterSerializer, CustomerProfileSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.CharField(required=False)
        self.fields['username'] = serializers.CharField(required=False)

    def validate(self, attrs):
        email_or_username = (attrs.get(self.username_field) or attrs.get('username') or '').strip()
        if not email_or_username:
            raise serializers.ValidationError({'email': 'Email is required.'})

        user_match = User.objects.filter(email__iexact=email_or_username).first()
        if not user_match:
            user_match = User.objects.filter(username__iexact=email_or_username).first()

        if user_match:
            attrs[self.username_field] = user_match.email
        else:
            attrs[self.username_field] = email_or_username.lower()

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class CustomerProfileUpdateView(generics.UpdateAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = CustomerProfile.objects.get_or_create(user=self.request.user)
        return profile
