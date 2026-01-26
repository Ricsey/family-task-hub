# app/webhooks/handlers.py
from sqlalchemy.orm import Session

from src.models.users import User


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
        None: This function doesn't return a value. It commits the new user to the database.

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
    clerk_id = user_data["id"]
    email = user_data["email_addresses"][0]["email_address"]
    first_name = user_data.get("first_name", "")
    last_name = user_data.get("last_name", "")

    full_name = f"{first_name} {last_name}".strip() if first_name or last_name else None

    user = User(
        clerk_id=clerk_id,
        email=email,
        full_name=full_name,
        is_active=True,
        is_superuser=False,
    )

    db.add(user)
    db.commit()
