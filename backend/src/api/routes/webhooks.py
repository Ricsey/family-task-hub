import json

from fastapi import APIRouter, HTTPException, Request, status
from svix import Webhook, WebhookVerificationError

from src.api.deps import SessionDep
from src.core.config import settings
from src.webhooks.handlers import handle_user_created

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def clerk_webhook(request: Request, session: SessionDep):
    payload = await request.body()

    if settings.CLERK_WEBHOOK_SECRET_KEY:
        try:
            wh = Webhook(settings.CLERK_WEBHOOK_SECRET_KEY)
            event = wh.verify(payload, dict(request.headers))
        except WebhookVerificationError:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid signature")
    else:
        event = json.loads(payload)

    event_type = event.get("type")
    user_data = event.get("data")

    if event_type == "user.created":
        handle_user_created(session, user_data)
