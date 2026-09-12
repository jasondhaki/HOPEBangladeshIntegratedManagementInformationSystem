import { expect, test } from "@playwright/test"

test.describe("app shell navigation", () => {
  test("desktop: sidebar is persistent and links navigate", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "Desktop Chrome",
      "desktop-only assertion"
    )

    await page.goto("/dashboard")

    const sidebarNav = page.getByRole("navigation", { name: "Main navigation" })
    await expect(sidebarNav).toBeVisible()
    await expect(sidebarNav.getByRole("link", { name: "Settings" })).toBeVisible()

    await sidebarNav.getByRole("link", { name: "Settings" }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
  })

  test("mobile 375px: sidebar opens from a drawer trigger and closes on navigation", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "Mobile 375px",
      "mobile-only assertion"
    )

    await page.goto("/dashboard")

    // `SidebarProvider` detects mobile via a `useEffect` (it must start at
    // `false` server-side to avoid a hydration mismatch), so the very first
    // click after paint can race that effect and toggle the desktop `open`
    // state instead of the mobile one. Wait for the effect to have committed
    // — bounded by two real paints, not a guessed timeout — before clicking.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    )

    // Sidebar nav is off-canvas until the trigger is tapped.
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden()

    const trigger = page.getByRole("button", { name: "Toggle navigation" })
    await expect(trigger).toBeVisible()
    const box = await trigger.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)

    await trigger.click()
    const sidebarNav = page.getByRole("navigation", { name: "Main navigation" })
    await expect(sidebarNav).toBeVisible()

    await sidebarNav.getByRole("link", { name: "Settings" }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(sidebarNav).toBeHidden()
  })
})

test.describe("shared DataTable on the dashboard", () => {
  test("search filters rows and pagination advances pages", async ({
    page,
  }) => {
    await page.goto("/dashboard")

    // The DataTable renders both the >=640px table and the <640px stacked
    // cards in the DOM at once (CSS decides which is visible), so row text
    // matches twice — `:visible` picks out whichever one this viewport shows.
    const visibleCell = (text: string) =>
      page.getByText(text).and(page.locator(":visible"))

    const search = page.getByPlaceholder("Search projects...")
    await expect(visibleCell("Sample Project A")).toBeVisible()

    await search.fill("Sample Project B")
    await expect(page.getByText("Sample Project A")).toBeHidden()
    await expect(visibleCell("Sample Project B")).toBeVisible()
    await search.fill("")

    await expect(page.getByText("Page 1 of 2")).toBeVisible()
    await page.getByRole("button", { name: "Next", exact: true }).click()
    await expect(page.getByText("Page 2 of 2")).toBeVisible()
  })

  test("mobile 375px: rows render as stacked cards, not a table", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "Mobile 375px",
      "mobile-only assertion"
    )

    await page.goto("/dashboard")

    await expect(page.locator('[data-slot="data-table-cards"]')).toBeVisible()
    await expect(page.getByRole("table")).toBeHidden()
  })

  test("desktop: rows render as a table", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "Desktop Chrome",
      "desktop-only assertion"
    )

    await page.goto("/dashboard")

    await expect(page.getByRole("table")).toBeVisible()
    await expect(page.locator('[data-slot="data-table-cards"]')).toBeHidden()
  })
})

test.describe("form primitives on Settings", () => {
  test("shows a validation error for an invalid field", async ({ page }) => {
    await page.goto("/settings")

    const nameInput = page.getByLabel("Organisation display name")
    await nameInput.fill("H")
    await page.getByRole("button", { name: "Save" }).click()

    await expect(
      page.getByText("Enter at least 2 characters.")
    ).toBeVisible()
  })

  test("mobile 375px: fields stack in a single column", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "Mobile 375px",
      "mobile-only assertion"
    )

    await page.goto("/settings")

    const nameField = page.getByLabel("Organisation display name")
    const languageField = page.getByLabel("Default language")

    const nameBox = await nameField.boundingBox()
    const languageBox = await languageField.boundingBox()

    // Stacked (single column) means the second field starts below the first,
    // not beside it.
    expect(languageBox && nameBox && languageBox.y).toBeGreaterThanOrEqual(
      (nameBox?.y ?? 0) + (nameBox?.height ?? 0)
    )
  })
})
