from importlib import import_module


def test_notifications_package_exists():
    mod = import_module("src.notifications")
    assert mod is not None
    assert mod.__file__ is not None
    assert mod.__file__.endswith("__init__.py")


def test_notifications_email_package_exists():
    mod = import_module("src.notifications.email")
    assert mod is not None
    assert mod.__file__ is not None
    assert mod.__file__.endswith("__init__.py")


def test_resend_can_be_imported():
    mod = import_module("resend")
    assert mod is not None
