import { Activity, FolderKanban, GraduationCap, Users } from "lucide-react"

import { sampleProjects } from "./sample-projects"
import { DashboardProjectsTable } from "./dashboard-projects-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Placeholder KPI cards — §5.5 names "dashboard summary cards" as one of the
// five mobile-first screens. Real figures arrive with P1-11 (role routing +
// live queries); these are static counts so the layout can be verified now.
const kpiCards = [
  { label: "Beneficiaries", value: "—", icon: Users },
  { label: "Students", value: "—", icon: GraduationCap },
  { label: "Active projects", value: "—", icon: FolderKanban },
  { label: "Activities this month", value: "—", icon: Activity },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Scaffold in progress — role-routed dashboards land with P1-11.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                {card.label}
                <card.icon className="size-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {card.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Shared DataTable demo</h2>
        <DashboardProjectsTable data={sampleProjects} />
      </div>
    </div>
  )
}
