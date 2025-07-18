import { pascalCase } from "change-case";
import { FormSchema } from "./generate-inputs";

export function generateList(entityName: string, schema: FormSchema): string {
  const entityLower = entityName.toLowerCase();
  const entityPascal = pascalCase(entityName);

  //generate table columns based on schema fields
  const tableColumns = schema.fields
    .map((field) => {
      if (field.name === "id") return null; // Skip ID field
      return `<TableColumn key="${field.name}" allowsSorting>
        ${field.label || field.name}
      </TableColumn>`;
    })
    .filter(Boolean)
    .join("\n");
  // Generate table cells for each field
  const tableCells = schema.fields
    .map((field) => {
      if (field.name === "id") return null; // Skip ID field
      return `<TableCell>
        {${entityLower}.${field.name}}
      </TableCell>`;
    })
    .filter(Boolean)
    .join("\n");

  const code = `
import { useState } from 'react';
import { columns } from './columns';
import { DataTable } from '@/components/table/data-table';
import { useData } from '@/core/context/use-data';
import type { ${entityPascal} } from '@dto/${entityLower}/entities/${entityLower}.entity';
import ${entityPascal}Page from './${entityPascal}Page';
import { FormSheet } from '@/components/form-sheet';

export default function ${entityPascal}List() {
  const { ${entityLower} } = useData();
  const { data: ${entityLower}List, isLoading } = ${entityLower}.useList();
  const [selected${entityPascal}, setSelected${entityPascal}] = useState<${entityPascal} | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  
  const handleAddNew = () => {
    setSelected${entityPascal}(null);
    setOpenDrawer(true);
  };

  const handleEdit = (row: { original: ${entityPascal} }) => {
    setSelected${entityPascal}(row.original);
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => setOpenDrawer(false);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={isLoading ? Array(10).fill({}) : ${entityLower}List} isLoading={isLoading}
      entityName="${entityPascal}"
      onAddNew={handleAddNew}
      onRowDoubleClick={handleEdit}
       />
      <FormSheet
        open={openDrawer}
        onOpenChange={handleDrawerClose}
        title={selected${entityPascal} ? 'Edit ${entityPascal}' : 'Create ${entityPascal}'}
        description={selected${entityPascal} ? 'Edit ${entityPascal} details' : 'Create a new ${entityPascal}'}
      >
        <div className="flex-1">
          <div className="space-y-8 px-6">
            <${entityPascal}Page ${entityLower}={selected${entityPascal}} />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
`;

  return code;
}
