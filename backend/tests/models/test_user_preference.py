from src.models.users import UserBase


class TestUserNotificationPreference:
    def test_email_notifications_enabled_defaults_to_true(self):
        user = UserBase(email="test@example.com", clerk_id="test_clerk_1")
        assert user.email_notifications_enabled is True

    def test_email_notifications_enabled_can_be_disabled(self):
        user = UserBase(
            email="test@example.com",
            clerk_id="test_clerk_2",
            email_notifications_enabled=False,
        )
        assert user.email_notifications_enabled is False
