import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generatePageCode(
  entityName: string,
  formFields: string,
  model: PrismaModel
): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();

  const relationsName = (model.fields ||= [])
    .filter((field) => field.isList)
    .map((field) => field.name)
    .filter(Boolean);
  const connectRelation = relationsName.map(
    (r) => `${r}:  { connect: [{ id: parseInt(${r}) }] },`
  );

  const relations =
    relationsName.length > 0 ? relationsName.join(",") + "," : "";

  // This function generates a React component for a page based on the entity name.
  const code = `import { useCallback, useState } from "react";
  import ${entityCapitalized}Form from "./${entityCapitalized}Form";
  import type { ${entityCapitalized} } from '@dto/${entityLower}/entities/${entityLower}.entity';
  import type { Create${entityCapitalized}Dto } from '@dto/${entityLower}/dto/create-${entityLower}.dto';
  import type { Update${entityCapitalized}Dto } from '@dto/${entityLower}/dto/update-${entityLower}.dto';
  import { useApi } from "@core/api/use-api";
  import type { ${entityCapitalized}FormDto } from './${entityLower}-form.type';


  type ${entityCapitalized}PageProps = {
    ${entityLower}: ${entityCapitalized}Dto | null;
  };

  export default function ${entityCapitalized}Page({${entityLower}}: ${entityCapitalized}PageProps) {
    const { useCreate, useUpdate } = useApi<${entityCapitalized}FormDto>("${entityLower}");
    const { mutateAsync: create } = useCreate<Create${entityCapitalized}Dto>();
    const { mutateAsync: update } = useUpdate<Update${entityCapitalized}Dto>();
    
    const handleOnSubmit = useCallback(
        async (data: ${entityCapitalized}) => {
          const { ${relations} ...rest } = data;
          
          const formattedData = {
            ...rest,
            ${connectRelation}
          };
    
          if (${entityLower} && ${entityLower}.id) {
            await update({ ...formattedData, id: ${entityLower}.id });
            setMessage('${entityLower} updated');
          } else {
            await create(formattedData);
            setMessage('${entityLower} created');
          }
        },
        [${entityLower}, create, update]
      );



    return (
      <div className="w-full mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {${entityLower} ? "Update ${entityCapitalized}" : "Create ${entityCapitalized}"}
        </h1>

        <${entityCapitalized}Form
          ${entityLower}={${entityLower}}
          onSubmit={handleOnSubmit}
        />
      </div>
    );
  }
    `;
  return code;
}
