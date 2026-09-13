from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'

    def ready(self):
        try:
            import jwt
            from rest_framework_simplejwt.backends import TokenBackend

            def safe_encode(self, payload):
                jwt_payload = payload.copy()
                if self.audience is not None:
                    jwt_payload['aud'] = self.audience
                if self.issuer is not None:
                    jwt_payload['iss'] = self.issuer

                token = jwt.encode(jwt_payload, self.signing_key, algorithm=self.algorithm)
                if isinstance(token, bytes):
                    return token.decode('utf-8')
                return str(token)

            TokenBackend.encode = safe_encode
        except Exception:
            pass

