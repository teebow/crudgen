import { pascalCase } from "change-case";

export function generateFormType(entityName: string): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();

  // This function generates a React component for a form based on the entity name.
  const code = `
import type { Create${entityCapitalized}Dto } from "@zod/${entityLower}.schema";
import type { Update${entityCapitalized}Dto } from "@zod/${entityLower}.schema";

export type ${entityCapitalized}FormDto = Create${entityCapitalized}Dto | Update${entityCapitalized}Dto;
`;
  return code;
}
