# app/webhooks/handlers.py
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.models.users import User


class WebhookDataError(ValueError):
    """Raised when incoming webhook data is invalid or incomplete."""


def handle_user_created(db: Session, user_data: dict) -> None:
    """
    Handle the creation of a new user from Clerk webhook data.

    This function processes user creation webhook events from Clerk, extracting user
    information and creating a corresponding User record in the database.

    Args:
        db (Session): SQLAlchemy database session for database operations.
        user_data (dict): Dictionary containing user data from Clerk webhook with the following structure:
            - id (str): Clerk user ID
            - email_addresses (list): List of email address objects, where first item contains:
                - email_address (str): User's email address
            - first_name (str, optional): User's first name
            - last_name (str, optional): User's last name

    Returns:
        None

    Side effects:
        It commits the new user to the database.

    Raises:
        SQLAlchemyError: If there's an error during database operations.
        KeyError: If required fields are missing from user_data.
        IndexError: If email_addresses list is empty.

    Example:
        >>> user_data = {
        ...     "id": "user_123",
        ...     "email_addresses": [{"email_address": "user@example.com"}],
        ...     "first_name": "John",
        ...     "last_name": "Doe",
        ... }
        >>> handle_user_created(db_session, user_data)
    """
    try:
        clerk_id = user_data.get("id")
        if not clerk_id:
            raise WebhookDataError("Clerk ID is missing")

        email_addresses = user_data.get("email_addresses")
        if not email_addresses or not isinstance(email_addresses, list):
            raise WebhookDataError("Missing or invalid email addresses")

        primary_email = email_addresses[0].get("email_address")
        if not primary_email:
            raise WebhookDataError("Missing email address")

        first_name = user_data.get("first_name", "")
        last_name = user_data.get("last_name", "")

        full_name = (
            f"{first_name} {last_name}".strip() if first_name or last_name else None
        )

        user = User(
            clerk_id=clerk_id,
            email=primary_email,
            full_name=full_name,
            is_active=True,
            is_superuser=False,
        )

        db.add(user)
        db.commit()

    except WebhookDataError:
        db.rollback()
        raise

    except SQLAlchemyError as exc:
        db.rollback()
        raise RuntimeError("Database error while creating a user") from exc
