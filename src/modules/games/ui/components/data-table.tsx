"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
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
  
  const selectedCollegeGamesCount = collegeData.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (game: any) => game.selected
  ).length;
  const selectedNflGamesCount = nflData.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (game: any) => game.selected
  ).length;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-4 w-full">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between">
          <h3 className="p-4 font-medium">College Games</h3>
          <div className="text-sm text-muted-foreground px-6">
            {selectedCollegeGamesCount} selected
          </div>
        </div>
        <div className="w-full rounded-lg border">
          <Table className="w-full table-fixed">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[52%]" />
              <col className="w-[18%]" />
            </colgroup>
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
                      <TableCell
                        key={cell.id}
                        className="text-sm py-3 px-1 md:px-3 truncate"
                        style={{ maxWidth: "6rem" }} // adjust width per column
                      >
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

      {isMobile && (
        <Separator orientation="horizontal" className="my-4 w-full" />
      )}

      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between">
          <h3 className="p-4 font-medium">NFL Games</h3>
          <div className="text-sm text-muted-foreground px-6">
            {selectedNflGamesCount} selected
          </div>
        </div>

        <div className="w-full rounded-lg border overflow-hidden">
          <Table className="w-full table-fixed">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[52%]" />
              <col className="w-[18%]" />
            </colgroup>
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
                      <TableCell
                        key={cell.id}
                        className="text-sm p-3 truncate"
                        style={{ maxWidth: "6rem" }}
                      >
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
    </div>
  );
}
