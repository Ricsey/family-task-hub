from src.api.routes.tasks import router


def test_router_still_has_routes():
    paths = [r.path for r in router.routes]
    assert "/tasks/" in paths
    assert "/tasks/{task_id}" in paths
