import { useState, useEffect } from "react";
import apiClient from "@/common/services/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/users/me/notification-preference")
      .then((res) => setEnabled(res.data.email_notifications_enabled))
      .catch(() => setEnabled(true))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    try {
      const res = await apiClient.patch("/users/me/notification-preference", {
        email_notifications_enabled: next,
      });
      setEnabled(res.data.email_notifications_enabled);
    } catch {
      setEnabled(!next);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Control how you receive notifications about task activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email when tasks are assigned to you.
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={enabled}
            onCheckedChange={toggle}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
