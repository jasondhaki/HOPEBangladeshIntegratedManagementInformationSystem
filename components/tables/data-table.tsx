"use client"

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react"

import { rowsToCsv } from "@/lib/export/csv"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// One feature set shared by every DataTable instance in the app, so every
// list screen (SPEC §4.7) gets identical filter/sort/paginate/export
// behaviour instead of each screen wiring TanStack Table from scratch.
const appTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

export type AppTableFeatures = typeof appTableFeatures

// `TValue` defaults to `any`, not `unknown`: an array mixing columns of
// different value types (string, boolean, ...) only typechecks against a
// single shared `ColumnDef<Features, TData, TValue>` when TValue is `any` —
// this is TanStack Table's own documented pattern for a generic table wrapper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppColumnDef<TData extends RowData, TValue = any> = ColumnDef<
  AppTableFeatures,
  TData,
  TValue
>

/** Bound column helper so entity tables get typed `.accessor(...)` columns against the shared feature set. */
export function createAppColumnHelper<TData extends RowData>() {
  return createColumnHelper<AppTableFeatures, TData>()
}

type DataTableProps<TData extends RowData> = {
  columns: AppColumnDef<TData>[]
  data: TData[]
  filterPlaceholder?: string
  exportFilename?: string
  emptyMessage?: string
  pageSize?: number
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  filterPlaceholder = "Search...",
  exportFilename = "export.csv",
  emptyMessage = "No results.",
  pageSize = 10,
}: DataTableProps<TData>) {
  const table = useTable({
    features: appTableFeatures,
    columns,
    data,
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
  })

  const rows = table.getRowModel().rows
  const headerGroups = table.getHeaderGroups()
  const columnLabels = new Map(
    headerGroups[0]?.headers.map((header) => [
      header.column.id,
      header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext()),
    ]) ?? []
  )

  function handleExport() {
    const headers = headerGroups[0]?.headers ?? []
    const headerLabels = headers.map((header) => String(columnLabels.get(header.column.id) ?? header.column.id))
    const exportRows = table
      .getFilteredRowModel()
      .rows.map((row) => headers.map((header) => String(row.getValue(header.column.id) ?? "")))

    const csv = rowsToCsv(headerLabels, exportRows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = exportFilename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3" data-slot="data-table">
      <div className="flex items-center gap-2">
        <Input
          value={table.state.globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          placeholder={filterPlaceholder}
          className="max-w-sm"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={table.getFilteredRowModel().rows.length === 0}
        >
          <Download />
          Export
        </Button>
      </div>

      {/* >= 640px: table layout */}
      <div className="hidden overflow-hidden rounded-lg border border-border sm:block">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="flex min-h-11 items-center gap-1 font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <SortIcon direction={header.column.getIsSorted()} />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* < 640px: the same rows, collapsed to stacked cards per SPEC §5.5 */}
      <div className="flex flex-col gap-3 sm:hidden" data-slot="data-table-cards">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-border p-3">
              {row.getAllCells().map((cell) => (
                <div
                  key={cell.id}
                  className="flex justify-between gap-3 py-1 text-sm first:pt-0 last:pb-0"
                >
                  <span className="font-medium text-muted-foreground">
                    {columnLabels.get(cell.column.id)}
                  </span>
                  <span className="text-right">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">
          Page {table.state.pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <ArrowUp className="size-3.5" />
  }
  if (direction === "desc") {
    return <ArrowDown className="size-3.5" />
  }
  return <ArrowUpDown className="size-3.5 text-muted-foreground" />
}
