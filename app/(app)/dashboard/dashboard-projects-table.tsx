"use client"

import { createAppColumnHelper, DataTable } from "@/components/tables/data-table"
import type { SampleProject } from "./sample-projects"

const columnHelper = createAppColumnHelper<SampleProject>()

const columns = [
  columnHelper.accessor("name", { header: "Project" }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("region", { header: "Region" }),
]

export function DashboardProjectsTable({ data }: { data: SampleProject[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      filterPlaceholder="Search projects..."
      exportFilename="sample-projects.csv"
    />
  )
}
