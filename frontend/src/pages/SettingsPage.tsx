import { NotificationSettings } from "@/components/NotificationSettings";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
      <div className="max-w-lg">
        <NotificationSettings />
      </div>
    </div>
  );
}
