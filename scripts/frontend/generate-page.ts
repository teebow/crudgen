import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generatePageCode(
  entityName: string,
  formFields: string,
  model: PrismaModel
): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();

  // This function generates a React component for a page based on the entity name.
  const code = `import { useCallback } from 'react';
  import ${entityCapitalized}Form from './${entityCapitalized}Form';
  import type { Create${entityCapitalized}Dto, Update${entityCapitalized}Dto, ${entityCapitalized}Dto } from '@zod/${entityLower}.schema';
  import { useApi } from '@/core/api/use-api';
  import type { ${entityCapitalized}FormDto } from './${entityLower}-form.type';
  
  type ${entityCapitalized}PageProps = {
    ${entityLower}: ${entityCapitalized}Dto | null;
    showTitle?: boolean;
  };
  
  export default function ${entityCapitalized}Page({ ${entityLower}, showTitle }: ${entityCapitalized}PageProps) {
    const { useCreate, useUpdate } = useApi('${entityLower}');
    const { mutateAsync: create } = useCreate<Create${entityCapitalized}Dto>();
    const { mutateAsync: update } = useUpdate<Update${entityCapitalized}Dto>();
  
    const handleOnSubmit = useCallback(
      async (data: ${entityCapitalized}FormDto) => {
        if (${entityLower} && ${entityLower}.id) {
          await update({ ...data, id: ${entityLower}.id });
        } else {
          await create(data);
        }
      },
      [${entityLower}, create, update]
    );
  
    return (
      <div className="mx-auto w-full p-4">
        {showTitle ? <h1 className="mb-4 text-2xl font-bold">{${entityLower} ? 'Update ${entityCapitalized}' : 'Create ${entityCapitalized}'}</h1> : null}
  
        <${entityCapitalized}Form ${entityLower}={${entityLower}} onSubmit={handleOnSubmit} />
      </div>
    );
  }
  
    `;
  return code;
}
