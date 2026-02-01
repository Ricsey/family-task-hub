"""
Script to sync Clerk users with the local users table.

This script fetches all users from Clerk's API and syncs them with the local
database. It will:
- Create new users that exist in Clerk but not locally
- Update existing users if their data has changed
- Optionally deactivate local users that no longer exist in Clerk

Usage:
    uv run python -m src.scripts.sync_clerk_users

    # With dry-run mode (no changes made):
    uv run python -m src.scripts.sync_clerk_users --dry-run

    # Deactivate users not in Clerk:
    uv run python -m src.scripts.sync_clerk_users --deactivate-missing
"""

import argparse
import sys
from dataclasses import dataclass

import httpx
from sqlmodel import Session, select

from src.core.db import engine
from src.models.tasks import Task  # noqa: F401
from src.models.users import User


@dataclass
class SyncStats:
    """Statistics from a sync operation."""

    created: int = 0
    updated: int = 0
    deactivated: int = 0
    unchanged: int = 0
    errors: int = 0


class ClerkAPIError(Exception):
    """Raised when Clerk API returns an error."""


def get_clerk_secret_key() -> str:
    """Get the Clerk secret key from environment."""
    import os

    secret_key = os.getenv("CLERK_SECRET_KEY")
    if not secret_key:
        raise ValueError(
            "CLERK_SECRET_KEY environment variable is not set. "
            "Please set it in your .env file."
        )
    return secret_key


def fetch_all_clerk_users() -> list[dict]:
    """
    Fetch all users from Clerk API with pagination.

    Returns:
        List of user dictionaries from Clerk.

    Raises:
        ClerkAPIError: If the API request fails.
    """
    secret_key = get_clerk_secret_key()
    base_url = "https://api.clerk.com/v1/users"
    headers = {
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }

    all_users = []
    limit = 100  # Max allowed by Clerk
    offset = 0

    with httpx.Client(timeout=30.0) as client:
        while True:
            params = {"limit": limit, "offset": offset}

            try:
                response = client.get(base_url, headers=headers, params=params)
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise ClerkAPIError(
                    f"Clerk API error: {e.response.status_code} - {e.response.text}"
                ) from e
            except httpx.RequestError as e:
                raise ClerkAPIError(f"Request error: {e}") from e

            users = response.json()

            if not users:
                break

            all_users.extend(users)

            if len(users) < limit:
                break

            offset += limit

    return all_users


def extract_user_data(clerk_user: dict) -> dict:
    """
    Extract relevant user data from a Clerk user object.

    Args:
        clerk_user: User data from Clerk API.

    Returns:
        Dictionary with normalized user data.
    """
    clerk_id = clerk_user.get("id")

    email_addresses = clerk_user.get("email_addresses", [])
    primary_email = None

    for email_obj in email_addresses:
        if email_obj.get("id") == clerk_user.get("primary_email_address_id"):
            primary_email = email_obj.get("email_address")
            break

    if not primary_email and email_addresses:
        primary_email = email_addresses[0].get("email_address")

    first_name = clerk_user.get("first_name") or ""
    last_name = clerk_user.get("last_name") or ""
    full_name = f"{first_name} {last_name}".strip() or None

    image_url = clerk_user.get("image_url")

    return {
        "clerk_id": clerk_id,
        "email": primary_email,
        "full_name": full_name,
        "image_url": image_url,
    }


def sync_user(
    db: Session, clerk_user_data: dict, dry_run: bool = False
) -> tuple[str, User | None]:
    """
    Sync a single Clerk user with the database.

    Args:
        db: Database session.
        clerk_user_data: Extracted user data from Clerk.
        dry_run: If True, don't make any changes.

    Returns:
        Tuple of (action, user) where action is 'created', 'updated', 'unchanged', or 'error'.
    """
    clerk_id = clerk_user_data.get("clerk_id")
    email = clerk_user_data.get("email")

    if not clerk_id or not email:
        print(f"   Skipping user with missing data: {clerk_user_data}")
        return ("error", None)

    existing_user = db.exec(select(User).where(User.clerk_id == clerk_id)).first()

    if existing_user:
        needs_update = False
        changes = []

        if existing_user.email != email:
            changes.append(f"email: {existing_user.email} -> {email}")
            needs_update = True

        if existing_user.full_name != clerk_user_data.get("full_name"):
            changes.append(
                f"full_name: {existing_user.full_name} -> {clerk_user_data.get('full_name')}"
            )
            needs_update = True

        if existing_user.image_url != clerk_user_data.get("image_url"):
            changes.append(
                f"image_url: {existing_user.image_url} -> {clerk_user_data.get('image_url')}"
            )
            needs_update = True

        if not existing_user.is_active:
            changes.append("is_active: False -> True")
            needs_update = True

        if needs_update:
            if not dry_run:
                existing_user.email = email
                existing_user.full_name = clerk_user_data.get("full_name")
                existing_user.image_url = clerk_user_data.get("image_url")
                existing_user.is_active = True
                db.add(existing_user)
            print(f"  Updated: {email} ({', '.join(changes)})")
            return ("updated", existing_user)
        else:
            return ("unchanged", existing_user)
    else:
        new_user = User(
            clerk_id=clerk_id,
            email=email,
            full_name=clerk_user_data.get("full_name"),
            image_url=clerk_user_data.get("image_url"),
            is_active=True,
            is_superuser=False,
        )
        if not dry_run:
            db.add(new_user)
        print(f"  Created: {email}")
        return ("created", new_user)


def deactivate_missing_users(
    db: Session, clerk_user_ids: set[str], dry_run: bool = False
) -> int:
    """
    Deactivate local users that no longer exist in Clerk.

    Args:
        db: Database session.
        clerk_user_ids: Set of Clerk user IDs.
        dry_run: If True, don't make any changes.

    Returns:
        Number of users deactivated.
    """
    local_users = db.exec(
        select(User).where(User.is_active)  # noqa: E712
    ).all()

    deactivated = 0
    for user in local_users:
        if user.clerk_id not in clerk_user_ids:
            if not dry_run:
                user.is_active = False
                db.add(user)
            print(f"  Deactivated: {user.email} (not found in Clerk)")
            deactivated += 1

    return deactivated


def sync_clerk_users(
    dry_run: bool = False, deactivate_missing: bool = False
) -> SyncStats:
    """
    Main sync function that orchestrates the sync process.

    Args:
        dry_run: If True, don't make any database changes.
        deactivate_missing: If True, deactivate local users not in Clerk.

    Returns:
        SyncStats with counts of actions taken.
    """
    stats = SyncStats()

    print("Fetching users from Clerk...")
    try:
        clerk_users = fetch_all_clerk_users()
    except ClerkAPIError as e:
        print(f"Failed to fetch Clerk users: {e}")
        sys.exit(1)

    print(f"Found {len(clerk_users)} users in Clerk")

    if dry_run:
        print("\n DRY RUN MODE - No changes will be made\n")

    print("\n Syncing users...")

    clerk_user_ids = set()

    with Session(engine) as db:
        for clerk_user in clerk_users:
            user_data = extract_user_data(clerk_user)
            clerk_user_ids.add(user_data["clerk_id"])

            action, _ = sync_user(db, user_data, dry_run)

            if action == "created":
                stats.created += 1
            elif action == "updated":
                stats.updated += 1
            elif action == "unchanged":
                stats.unchanged += 1
            elif action == "error":
                stats.errors += 1

        if deactivate_missing:
            print("\n Checking for users to deactivate...")
            stats.deactivated = deactivate_missing_users(db, clerk_user_ids, dry_run)

        if not dry_run:
            db.commit()
            print("\n Changes committed to database")
        else:
            print("\n Dry run - no changes were made")

    return stats


def main():
    parser = argparse.ArgumentParser(description="Sync Clerk users with local database")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )
    parser.add_argument(
        "--deactivate-missing",
        action="store_true",
        help="Deactivate local users not found in Clerk",
    )

    args = parser.parse_args()

    print("=" * 50)
    print("Clerk User Sync Script")
    print("=" * 50)

    stats = sync_clerk_users(
        dry_run=args.dry_run, deactivate_missing=args.deactivate_missing
    )

    print("\n" + "=" * 50)
    print(" Sync Summary:")
    print(f"   Created:     {stats.created}")
    print(f"   Updated:     {stats.updated}")
    print(f"   Unchanged:   {stats.unchanged}")
    print(f"   Deactivated: {stats.deactivated}")
    print(f"   Errors:      {stats.errors}")
    print("=" * 50)


if __name__ == "__main__":
    main()
