import { pascalCase } from "change-case";

export function generatePageCode(
  entityName: string,
  formFields: string
): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();

  // This function generates a React component for a page based on the entity name.
  const code = `import { useState } from "react";
  import ${entityCapitalized}Form from "./${entityCapitalized}Form";
  import type { ${entityCapitalized}Dto } from "@dto/${entityLower}/dto/${entityLower}.dto";
  import { useApi } from "../core/api/use-api";

  type ${entityCapitalized}PageProps = {
    ${entityLower}: ${entityCapitalized}Dto | null;
  };

  export default function ${entityCapitalized}Page({${entityLower}}: ${entityCapitalized}PageProps) {
    const { useCreate, useUpdate } = useApi<${entityCapitalized}Dto>("${entityLower}");
    const { mutateAsync: create } = useCreate();
    const { mutateAsync: update } = useUpdate();
    
    const [message, setMessage] = useState("");

    const create${entityCapitalized} = async (${entityLower}Data: Omit<${entityCapitalized}Dto, "id">) => {
      await create(${entityLower}Data);
      setMessage(\`${entityCapitalized} created\`);
    };

    const update${entityCapitalized} = async (${entityLower}Data: ${entityCapitalized}Dto) => {
      await update(${entityLower}Data);
      setMessage(\`${entityCapitalized} updated\`);
    };

    return (
      <div className="w-full mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {${entityLower} ? "Update ${entityCapitalized}" : "Create ${entityCapitalized}"}
        </h1>

        <${entityCapitalized}Form
          ${entityLower}={${entityLower}}
          onSubmit={(${entityLower}: ${entityCapitalized}Dto) => {
            if (${entityLower}?.id) {
              update${entityCapitalized}({ ...${entityLower}, id: ${entityLower}.id });
            } else {
              create${entityCapitalized}(${entityLower});
            }
          }}
        />
  
        {message && (
          <div className="mt-4 text-green-600 font-medium">{message}</div>
        )}
      </div>
    );
  }
    `;
  return code;
}
