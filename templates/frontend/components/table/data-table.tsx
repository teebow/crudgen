import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import type { PaginatedResult } from "@zod/common/query.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

type PaginatedOnly<T> = Omit<PaginatedResult<T>, "data">;
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  entityName?: string; // Optional: name of the entity for better UX
  isLoading?: boolean;
  paginationMetaData: PaginatedOnly<TData>;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (sort: SortingState) => void;
  onFilterChange: (filters: ColumnFiltersState) => void;
  onRowDoubleClick?: (row: Row<TData>) => void;
  onAddNew?: () => void; // Optional: callback for adding new entity
}

export function DataTable<TData, TValue>({
  columns,
  data,
  entityName,
  isLoading,
  paginationMetaData,
  onPageChange,
  onLimitChange,
  onSortChange,
  onFilterChange,
  onRowDoubleClick,
  onAddNew,
}: DataTableProps<TData, TValue>) {
  const [sorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const debouncedFilter = useDebounce(columnFilters, 500);
  const { total, totalPages, limit, page } = paginationMetaData;
  const filter = columnFilters[0];

  useEffect(() => {
    if (debouncedFilter && debouncedFilter[0]?.id)
      onFilterChange(debouncedFilter);
  }, [debouncedFilter, onFilterChange]);

  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton className="h-4" />,
          }))
        : columns,
    [isLoading, columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: (updater) => {
      const sort = typeof updater === "function" ? updater(sorting) : updater;
      onSortChange(sort);
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: total,
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize: limit })
          : updater;
      onPageChange(newPagination.pageIndex + 1);
      onLimitChange(+newPagination.pageSize);
    },

    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Button
          variant="outline"
          className="mr-2"
          onClick={onAddNew}
          disabled={!onAddNew}
        >
          <Plus /> {entityName}
        </Button>
        <Select
          onValueChange={(value) =>
            setColumnFilters([{ id: value, value: filter?.value }])
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {table.getFlatHeaders().map((header) => (
              <SelectItem value={header.id} key={header.id}>
                {header.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Recherche"
          //value={filter && filter.value ? (table.getColumn(filter.id)?.getFilterValue() as string) : ''}
          onChange={(event) =>
            setColumnFilters([
              { id: filter?.id ?? null, value: event.target.value },
            ])
          }
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
