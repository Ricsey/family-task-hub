import base64
import hashlib
import hmac

from fastapi import APIRouter, HTTPException, Request, status

from src.api.deps import SessionDep
from src.core.config import settings
from src.webhooks.handlers import handle_user_created

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def duunoname(request: Request, session: SessionDep):
    verify_clerk_webhook(request)

    payload = await request.json()
    event_type = payload["type"]
    user_data = payload["data"]

    if event_type == "user.created":
        handle_user_created(session, user_data)


async def verify_clerk_webhook(request: Request):
    """
    Verify the authenticity of a Clerk webhook request using HMAC signature validation.

    This function validates webhook requests from Clerk by verifying the HMAC-SHA256
    signature provided in the request headers against the computed signature using
    the webhook secret key.

    Args:
        request (Request): The incoming FastAPI/Starlette request object containing
            the webhook payload and headers.

    Returns:
        None: This function doesn't return a value but will raise an exception if
            verification fails.

    Raises:
        HTTPException:
            - 400 Bad Request if required svix headers (svix-id, svix-timestamp,
              svix-signature) are missing
            - 400 Bad Request if the computed signature doesn't match the received
              signature, indicating an invalid or tampered request

    Notes:
        - The function expects the CLERK_WEBHOOK_SECRET_KEY to be configured in settings
        - The secret key is automatically stripped of the "whsec_" prefix if present
        - Uses constant-time comparison (hmac.compare_digest) to prevent timing attacks
        - Signature format follows Svix webhook signature specification (v1,base64_signature)
    """
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing headers"
        )

    body = await request.body()

    signed_content = f"{svix_id}.{svix_timestamp}.".encode() + body

    secret = settings.CLERK_WEBHOOK_SECRET_KEY
    if secret.startswith("whsec_"):
        secret = secret[6:]
    secret_bytes = base64.b64decode(secret)

    expected = hmac.new(
        secret_bytes,
        signed_content,
        hashlib.sha256,
    ).digest()

    expected_signature: str = f"v1,{base64.b64encode(expected).decode('utf-8')}"
    received_signature: str = svix_signature

    if not hmac.compare_digest(expected_signature, received_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
