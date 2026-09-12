export type SampleProject = {
  id: string
  name: string
  status: "Active" | "Planning" | "Closed"
  region: string
}

// Static placeholder rows for the shared DataTable demo — SPEC §35.1's real
// KPI/project data arrives with P1-11 (dashboard shell, role routing).
export const sampleProjects: SampleProject[] = [
  { id: "1", name: "Sample Project A", status: "Active", region: "Dhaka" },
  { id: "2", name: "Sample Project B", status: "Planning", region: "Chattogram" },
  { id: "3", name: "Sample Project C", status: "Active", region: "Khulna" },
  { id: "4", name: "Sample Project D", status: "Closed", region: "Rajshahi" },
  { id: "5", name: "Sample Project E", status: "Active", region: "Sylhet" },
  { id: "6", name: "Sample Project F", status: "Planning", region: "Barishal" },
  { id: "7", name: "Sample Project G", status: "Active", region: "Rangpur" },
  { id: "8", name: "Sample Project H", status: "Closed", region: "Mymensingh" },
  { id: "9", name: "Sample Project I", status: "Active", region: "Dhaka" },
  { id: "10", name: "Sample Project J", status: "Planning", region: "Chattogram" },
  { id: "11", name: "Sample Project K", status: "Active", region: "Khulna" },
  { id: "12", name: "Sample Project L", status: "Closed", region: "Rajshahi" },
]
