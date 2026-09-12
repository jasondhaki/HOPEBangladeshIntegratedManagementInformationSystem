import { describe, expect, it } from "vitest"

import { navItems } from "@/components/layout/nav-items"

describe("navItems", () => {
  it("covers the SPEC §4.7 top-level module list", () => {
    expect(navItems.map((item) => item.label)).toEqual([
      "Dashboard",
      "Beneficiaries",
      "Education",
      "Activities",
      "Health",
      "Vocational",
      "Attendance",
      "Assessments",
      "Certificates",
      "Follow-up",
      "Projects",
      "Media",
      "HR",
      "Admin",
      "Finance",
      "Reports",
      "Settings",
    ])
  })

  it("has unique hrefs", () => {
    const hrefs = navItems.map((item) => item.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it("has unique labels", () => {
    const labels = navItems.map((item) => item.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it("every href is an absolute app path with a matching icon", () => {
    for (const item of navItems) {
      expect(item.href.startsWith("/")).toBe(true)
      expect(item.icon).toBeTypeOf("object")
    }
  })
})
