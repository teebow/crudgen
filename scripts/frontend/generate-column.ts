import { pascalCase } from "change-case";
import { FormSchema } from "./generate-inputs";

export function generateColumns(
  entityName: string,
  schema: FormSchema
): string {
  const entityLower = entityName.toLowerCase();

  //generate table columns based on schema fields
  const tableColumns = schema.fields
    .map((field) => {
      if (field.name === "id") return null; // Skip ID field
      return `{
        accessorKey: '${field.name}',
        header: ({ column }) => <DataTableColumnHeader column={column} title="${field.label || field.name}" />,
      }`;
    })
    .filter(Boolean)
    .join(",\n");

  const code = `
import { type ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Trash } from 'lucide-react';
import type { ${pascalCase(entityName)} } from '@dto/${entityLower}/entities/${entityLower}.entity'; 
export const columns: ColumnDef<${pascalCase(entityName)}>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  ${tableColumns},
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.name)}>Copy user name</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
`;

  return code;
}
