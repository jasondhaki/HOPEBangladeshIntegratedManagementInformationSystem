import { SettingsDemoForm } from "./settings-demo-form"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Master data, users, roles, and configuration land in later phases.
        </p>
      </div>

      <div className="max-w-md">
        <h2 className="mb-3 text-lg font-medium">Form primitives demo</h2>
        <SettingsDemoForm />
      </div>
    </div>
  )
}
