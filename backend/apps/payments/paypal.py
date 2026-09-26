import json
import base64
import time
import urllib.request
import urllib.parse
import urllib.error
from django.conf import settings


class PayPalError(Exception):
    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class PayPalClient:
    _cached_token = None
    _token_expiry = 0

    @classmethod
    def get_base_url(cls):
        mode = getattr(settings, 'PAYPAL_MODE', 'sandbox').lower()
        if mode == 'live':
            return 'https://api-m.paypal.com'
        return 'https://api-m.sandbox.paypal.com'

    @classmethod
    def get_credentials(cls):
        client_id = getattr(settings, 'PAYPAL_CLIENT_ID', '').strip()
        client_secret = getattr(settings, 'PAYPAL_CLIENT_SECRET', '').strip()
        if not client_id or not client_secret:
            raise PayPalError(
                "PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in settings or environment.",
                status_code=500
            )
        return client_id, client_secret

    @classmethod
    def get_access_token(cls):
        # Return cached token if valid (buffer 60 seconds)
        if cls._cached_token and time.time() < (cls._token_expiry - 60):
            return cls._cached_token

        client_id, client_secret = cls.get_credentials()
        base_url = cls.get_base_url()
        token_url = f"{base_url}/v1/oauth2/token"

        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')

        data = urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode('utf-8')

        req = urllib.request.Request(token_url, data=data, method='POST')
        req.add_header('Authorization', f'Basic {encoded_credentials}')
        req.add_header('Accept', 'application/json')
        req.add_header('Accept-Language', 'en_US')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        req.add_header('User-Agent', 'TayaraInsurance-Backend/1.0')

        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                payload = json.loads(response.read().decode('utf-8'))
                cls._cached_token = payload['access_token']
                cls._token_expiry = time.time() + payload.get('expires_in', 3600)
                return cls._cached_token
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                err_data = json.loads(error_body)
                error_msg = err_data.get('error_description') or err_data.get('message') or "PayPal authentication failed."
            except Exception:
                error_msg = f"PayPal authentication error: {error_body}"
            raise PayPalError(error_msg, status_code=e.code, details={'raw': error_body})
        except Exception as e:
            raise PayPalError(f"Network error connecting to PayPal: {str(e)}", status_code=502)

    @classmethod
    def create_order(cls, order):
        """
        Creates a PayPal checkout order for the given Order instance.
        """
        access_token = cls.get_access_token()
        base_url = cls.get_base_url()
        orders_url = f"{base_url}/v2/checkout/orders"

        total_val = f"{order.total:.2f}"
        currency = (order.currency or "USD").upper()

        order_payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": str(order.order_number),
                    "description": f"Tayara Travel Insurance - Policy Order {order.order_number}",
                    "custom_id": str(order.order_number),
                    "amount": {
                        "currency_code": currency,
                        "value": total_val
                    }
                }
            ],
            "application_context": {
                "brand_name": "Tayara Travel Insurance",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "shipping_preference": "NO_SHIPPING"
            }
        }

        data = json.dumps(order_payload).encode('utf-8')
        req = urllib.request.Request(orders_url, data=data, method='POST')
        req.add_header('Authorization', f'Bearer {access_token}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Accept', 'application/json')
        req.add_header('User-Agent', 'TayaraInsurance-Backend/1.0')

        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                err_data = json.loads(error_body)
                msg = err_data.get('message') or err_data.get('details', [{}])[0].get('description') or "PayPal order creation failed."
            except Exception:
                msg = f"PayPal order creation failed: {error_body}"
            raise PayPalError(msg, status_code=e.code, details={'raw': error_body})
        except Exception as e:
            raise PayPalError(f"Network error creating PayPal order: {str(e)}", status_code=502)

    @classmethod
    def capture_order(cls, paypal_order_id):
        """
        Captures funds for an approved PayPal checkout order.
        """
        access_token = cls.get_access_token()
        base_url = cls.get_base_url()
        capture_url = f"{base_url}/v2/checkout/orders/{paypal_order_id}/capture"

        data = b'{}'
        req = urllib.request.Request(capture_url, data=data, method='POST')
        req.add_header('Authorization', f'Bearer {access_token}')
        req.add_header('Content-Type', 'application/json')
        req.add_header('Accept', 'application/json')
        req.add_header('User-Agent', 'TayaraInsurance-Backend/1.0')

        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                err_data = json.loads(error_body)
                msg = err_data.get('message') or err_data.get('details', [{}])[0].get('description') or "PayPal capture failed."
            except Exception:
                msg = f"PayPal capture failed: {error_body}"
            raise PayPalError(msg, status_code=e.code, details={'raw': error_body})
        except Exception as e:
            raise PayPalError(f"Network error capturing PayPal payment: {str(e)}", status_code=502)
