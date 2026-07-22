def _base_html(body: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
{body}
</body>
</html>"""


def render_assigned_email(
    task_title: str,
    task_category: str,
    due_date: str,
    actor_name: str,
) -> str:
    body = f"""
<h2>Task Assigned</h2>
<p><strong>{actor_name}</strong> assigned you a task.</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:4px 8px;font-weight:bold;">Task</td><td>{task_title}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Category</td><td>{task_category}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Due</td><td>{due_date}</td></tr>
</table>"""
    return _base_html(body)


def render_unassigned_email(
    task_title: str,
    task_category: str,
    due_date: str,
    actor_name: str,
) -> str:
    body = f"""
<h2>Task Unassigned</h2>
<p>You are no longer responsible for a task.</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:4px 8px;font-weight:bold;">Task</td><td>{task_title}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Category</td><td>{task_category}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Due</td><td>{due_date}</td></tr>
</table>
<p>Unassigned by <strong>{actor_name}</strong>.</p>"""
    return _base_html(body)
