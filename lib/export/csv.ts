function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Builds an RFC 4180-ish CSV string (CRLF row endings) from a header row and
 * an array of string rows. Used by the shared `DataTable`'s "Export" action.
 */
export function rowsToCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((line) =>
    line.map(escapeCsvField).join(",")
  )
  return lines.join("\r\n")
}
