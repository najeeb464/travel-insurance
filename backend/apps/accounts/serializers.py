from rest_framework import serializers
from .models import User, CustomerProfile


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            'date_of_birth',
            'nationality',
            'passport_number',
            'passport_expiry',
            'address',
            'city',
            'country',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(read_only=True)
    is_staff = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'role',
            'is_staff',
            'is_superuser',
            'phone_number',
            'profile',
        ]
        read_only_fields = ['id', 'role', 'is_staff', 'is_superuser']

    def get_is_staff(self, obj):
        return bool(obj.is_staff or obj.is_superuser or obj.role in [User.Role.ADMIN, User.Role.STAFF])


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name', 'phone_number']

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this email address already exists. Please sign in instead.')
        return email

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        attrs['email'] = email

        raw_username = attrs.get('username', '').strip()
        if not raw_username:
            raw_username = email.split('@')[0]

        import re, uuid
        clean_user = re.sub(r'[^a-zA-Z0-9_.]', '', raw_username) or 'user'
        candidate = clean_user
        counter = 1
        while User.objects.filter(username__iexact=candidate).exists():
            candidate = f"{clean_user}_{uuid.uuid4().hex[:4]}"
            counter += 1
            if counter > 10:
                candidate = f"user_{uuid.uuid4().hex[:8]}"
                break

        attrs['username'] = candidate
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '').strip(),
            last_name=validated_data.get('last_name', '').strip(),
            phone_number=validated_data.get('phone_number', '').strip(),
        )
        CustomerProfile.objects.get_or_create(user=user)
        return user
