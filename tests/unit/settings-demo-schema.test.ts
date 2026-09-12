import { describe, expect, it } from "vitest"

import { settingsDemoSchema } from "@/app/(app)/settings/settings-demo-form"

describe("settingsDemoSchema", () => {
  it("accepts valid input", () => {
    const result = settingsDemoSchema.safeParse({
      organisationName: "HOPE Worldwide Bangladesh",
      defaultLanguage: "en",
      notifyByEmail: true,
    })

    expect(result.success).toBe(true)
  })

  it("rejects a name that is too short", () => {
    const result = settingsDemoSchema.safeParse({
      organisationName: "H",
      defaultLanguage: "en",
      notifyByEmail: true,
    })

    expect(result.success).toBe(false)
  })

  it("rejects an unsupported language", () => {
    const result = settingsDemoSchema.safeParse({
      organisationName: "HOPE Worldwide Bangladesh",
      defaultLanguage: "fr",
      notifyByEmail: true,
    })

    expect(result.success).toBe(false)
  })
})
