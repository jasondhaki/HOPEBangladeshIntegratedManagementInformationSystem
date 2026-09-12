import { describe, expect, it } from "vitest"

import { rowsToCsv } from "@/lib/export/csv"

describe("rowsToCsv", () => {
  it("joins headers and rows with commas and CRLF line endings", () => {
    const csv = rowsToCsv(
      ["Name", "Status"],
      [
        ["Sample Project A", "Active"],
        ["Sample Project B", "Planning"],
      ]
    )

    expect(csv).toBe(
      "Name,Status\r\nSample Project A,Active\r\nSample Project B,Planning"
    )
  })

  it("quotes and escapes fields containing commas, quotes, or newlines", () => {
    const csv = rowsToCsv(
      ["Name"],
      [['Say "hi", please'], ["Line one\nLine two"]]
    )

    expect(csv).toBe('Name\r\n"Say ""hi"", please"\r\n"Line one\nLine two"')
  })

  it("returns just the header row when there are no data rows", () => {
    expect(rowsToCsv(["Name", "Status"], [])).toBe("Name,Status")
  })
})
