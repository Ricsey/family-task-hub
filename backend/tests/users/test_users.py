import pytest
from pydantic import ValidationError

from src.models.users import UserBase


class TestUserBase:
    def test_user_base_valid_creation(self):
        """Test creating a UserBase with all valid fields."""
        user = UserBase(
            email="test@example.com",
            full_name="John Doe",
            is_active=True,
            is_superuser=False,
        )
        assert user.email == "test@example.com"
        assert user.full_name == "John Doe"
        assert user.is_active is True
        assert user.is_superuser is False

    def test_user_base_minimal_creation(self):
        """Test creating a UserBase with only required fields."""
        user = UserBase(email="minimal@example.com")
        assert user.email == "minimal@example.com"
        assert user.full_name is None
        assert user.is_active is True
        assert user.is_superuser is False

    def test_user_base_invalid_email(self):
        """Test that invalid email raises ValidationError."""
        with pytest.raises(ValidationError):
            UserBase(email="invalid-email")

    def test_user_base_email_too_long(self):
        """Test that email exceeding max_length raises ValidationError."""
        long_email = "a" * 250 + "@example.com"
        with pytest.raises(ValidationError):
            UserBase(email=long_email)

    def test_user_base_full_name_too_long(self):
        """Test that full_name exceeding max_length raises ValidationError."""
        long_name = "a" * 256
        with pytest.raises(ValidationError):
            UserBase(email="test@example.com", full_name=long_name)

    def test_user_base_is_active_defaults_true(self):
        """Test that is_active defaults to True."""
        user = UserBase(email="test@example.com")
        assert user.is_active is True

    def test_user_base_is_superuser_defaults_false(self):
        """Test that is_superuser defaults to False."""
        user = UserBase(email="test@example.com")
        assert user.is_superuser is False
