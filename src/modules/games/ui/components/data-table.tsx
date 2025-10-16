"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile'
import { is } from "drizzle-orm";
import { Separator } from "@/components/ui/separator";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  collegeData: TData[];
  nflData: TData[];
  onRowClick?: (row: TData) => void;
  noResultsMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  collegeData,
  nflData,
  onRowClick,
  noResultsMessage,
}: DataTableProps<TData, TValue>) {  
  const isMobile = useIsMobile();
  const collegeTable = useReactTable({
    data: collegeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const nflTable = useReactTable({
    data: nflData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex-row md:flex items-center md:items-start justify-between gap-6 md:gap-4">
      <div className="w-full">
        <h3 className="p-4 font-medium">College Games</h3>
        <Table className="rounded-lg border">
          <TableBody>
            {collegeTable.getRowModel().rows?.length ? (
              collegeTable.getRowModel().rows.map((row) => (
                <TableRow
                  onClick={() => onRowClick?.(row.original)}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm p-4">
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
                  className="h-19 text-center text-muted-foreground"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {isMobile && <Separator orientation="horizontal" className="my-4 w-full" />}
      <div className="w-full">
        <h3 className="p-4 font-medium">NFL Games</h3>
        <Table className="rounded-lg border">
          <TableBody>
            {nflTable.getRowModel().rows?.length ? (
              nflTable.getRowModel().rows.map((row) => (
                <TableRow
                  onClick={() => onRowClick?.(row.original)}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm p-4">
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
                  className="h-19 text-center text-muted-foreground"
                >
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
