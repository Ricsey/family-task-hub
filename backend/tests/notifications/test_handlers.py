from unittest.mock import patch

import pytest

from src.notifications.handlers import handle_task_assignee_changed


class TestHandleTaskAssigneeChanged:
    @patch("src.notifications.handlers.send_notification_email.delay")
    @patch("src.notifications.handlers.Session")
    @patch("src.notifications.handlers.engine")
    def test_new_assignee_notified_on_assignment(
        self, mock_engine, mock_session_cls, mock_delay
    ):
        mock_user = type("User", (), {"email_notifications_enabled": True})()
        mock_session = mock_session_cls.return_value.__enter__.return_value
        mock_session.exec.return_value.first.return_value = mock_user

        payload = {
            "task_id": 1,
            "task_title": "Test",
            "task_category": "Chore",
            "task_due_date": "2026-07-22",
            "previous_assignee_id": None,
            "previous_assignee_email": None,
            "new_assignee_id": "user-2",
            "new_assignee_email": "user2@test.com",
            "new_assignee_name": "User Two",
            "actor_name": "Alice",
        }
        handle_task_assignee_changed(payload)

        mock_delay.assert_called_once()
        args = mock_delay.call_args[1]
        assert args["to_email"] == "user2@test.com"
        assert "Task Assigned" in args["subject"]

    @patch("src.notifications.handlers.send_notification_email.delay")
    @patch("src.notifications.handlers.Session")
    @patch("src.notifications.handlers.engine")
    def test_previous_assignee_notified_on_unassignment(
        self, mock_engine, mock_session_cls, mock_delay
    ):
        mock_user = type("User", (), {"email_notifications_enabled": True})()
        mock_session = mock_session_cls.return_value.__enter__.return_value
        mock_session.exec.return_value.first.return_value = mock_user

        payload = {
            "task_id": 1,
            "task_title": "Test",
            "task_category": "Chore",
            "task_due_date": "2026-07-22",
            "previous_assignee_id": "user-1",
            "previous_assignee_email": "user1@test.com",
            "new_assignee_id": None,
            "new_assignee_email": None,
            "new_assignee_name": None,
            "actor_name": "Alice",
        }
        handle_task_assignee_changed(payload)

        mock_delay.assert_called_once()
        args = mock_delay.call_args[1]
        assert args["to_email"] == "user1@test.com"
        assert "Task Unassigned" in args["subject"]

    @patch("src.notifications.handlers.send_notification_email.delay")
    @patch("src.notifications.handlers.Session")
    @patch("src.notifications.handlers.engine")
    def test_both_notified_on_reassignment(
        self, mock_engine, mock_session_cls, mock_delay
    ):
        mock_user = type("User", (), {"email_notifications_enabled": True})()
        mock_session = mock_session_cls.return_value.__enter__.return_value
        mock_session.exec.return_value.first.return_value = mock_user

        payload = {
            "task_id": 1,
            "task_title": "Test",
            "task_category": "Chore",
            "task_due_date": "2026-07-22",
            "previous_assignee_id": "user-1",
            "previous_assignee_email": "user1@test.com",
            "new_assignee_id": "user-2",
            "new_assignee_email": "user2@test.com",
            "new_assignee_name": "User Two",
            "actor_name": "Alice",
        }
        handle_task_assignee_changed(payload)

        assert mock_delay.call_count == 2
        emails = [call[1]["to_email"] for call in mock_delay.call_args_list]
        assert "user1@test.com" in emails
        assert "user2@test.com" in emails

    @patch("src.notifications.handlers.send_notification_email.delay")
    @patch("src.notifications.handlers.Session")
    @patch("src.notifications.handlers.engine")
    def test_disabled_notifications_skips(
        self, mock_engine, mock_session_cls, mock_delay
    ):
        mock_user = type("User", (), {"email_notifications_enabled": False})()
        mock_session = mock_session_cls.return_value.__enter__.return_value
        mock_session.exec.return_value.first.return_value = mock_user

        payload = {
            "task_id": 1,
            "task_title": "Test",
            "task_category": "Chore",
            "task_due_date": "2026-07-22",
            "previous_assignee_id": None,
            "previous_assignee_email": None,
            "new_assignee_id": "user-2",
            "new_assignee_email": "user2@test.com",
            "new_assignee_name": "User Two",
            "actor_name": "Alice",
        }
        handle_task_assignee_changed(payload)

        mock_delay.assert_not_called()

    @patch("src.notifications.handlers.send_notification_email.delay")
    @patch("src.notifications.handlers.Session")
    @patch("src.notifications.handlers.engine")
    def test_user_not_found_in_db_skips(
        self, mock_engine, mock_session_cls, mock_delay
    ):
        mock_session = mock_session_cls.return_value.__enter__.return_value
        mock_session.exec.return_value.first.return_value = None

        payload = {
            "task_id": 1,
            "task_title": "Test",
            "task_category": "Chore",
            "task_due_date": "2026-07-22",
            "previous_assignee_id": None,
            "previous_assignee_email": None,
            "new_assignee_id": "user-2",
            "new_assignee_email": "user2@test.com",
            "new_assignee_name": "User Two",
            "actor_name": "Alice",
        }
        handle_task_assignee_changed(payload)

        mock_delay.assert_not_called()
