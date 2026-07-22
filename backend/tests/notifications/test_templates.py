from src.notifications.templates import render_assigned_email, render_unassigned_email


class TestEmailTemplates:
    def test_assigned_template_includes_task_title(self):
        html = render_assigned_email(
            task_title="Grocery Shopping",
            task_category="Shopping",
            due_date="2026-07-25",
            actor_name="Alice",
        )
        assert "Grocery Shopping" in html
        assert "Shopping" in html
        assert "2026-07-25" in html
        assert "Alice" in html
        assert "assigned" in html

    def test_unassigned_template_informs_user(self):
        html = render_unassigned_email(
            task_title="Fix Leaky Faucet",
            task_category="Chore",
            due_date="2026-07-24",
            actor_name="Bob",
        )
        assert "Fix Leaky Faucet" in html
        assert "You are no longer responsible" in html
        assert "Bob" in html
