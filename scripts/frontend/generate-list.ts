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
import ${entityPascal}Page from './${entityPascal}Page';
import { FormSheet } from '@/components/form-sheet';

import type { Paginated${entityPascal}sDto, ${entityPascal}Dto } from '@zod/${entityLower}.schema';
import type { QueryOptionsDto } from '@zod/common/query.schema';
import { useTableActions } from '@/components/table/hooks/use-table-actions';

export default function ${entityPascal}List() {
  const [queryOptions, setQueryOptions] = useState<QueryOptionsDto>({ page: 1, limit: 10 });
  const [selected${entityPascal}, setSelected${entityPascal}] = useState<${entityPascal}Dto | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const {
    handleAddNew,
    handleEdit,
    handleDrawerClose,
    handleSortingChange,
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
  } = useTableActions<${entityPascal}Dto>({
    setQueryOptions,
    setSelectedItem: setSelected${entityPascal},
    setOpenDrawer,
  });

  const { ${entityLower} } = useData();
  const { data: ${entityLower}List, isLoading } = ${entityLower}.useList<Paginated${entityPascal}sDto>(queryOptions);
  const { data: ${entityLower}ListData = [], ...paginationMetaData } = ${entityLower}List ?? {};

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={isLoading ? Array(10).fill({}) : ${entityLower}ListData}
        isLoading={isLoading}
        entityName="${entityPascal}"
        onAddNew={handleAddNew}
        onRowDoubleClick={handleEdit}
        paginationMetaData={paginationMetaData as Omit<Paginated${entityPascal}sDto, 'data'>}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSortChange={handleSortingChange}
        onFilterChange={handleFilterChange}
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
