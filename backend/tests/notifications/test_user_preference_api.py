from src.api.routes.users import router


def test_notification_preference_route_exists():
    routes = [r.path for r in router.routes]
    assert "/users/me/notification-preference" in routes
