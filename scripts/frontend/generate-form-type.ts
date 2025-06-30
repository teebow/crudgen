import { pascalCase } from "change-case";

export function generateFormType(entityName: string): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();

  // This function generates a React component for a form based on the entity name.
  const code = `
import type { Create${entityCapitalized}Dto } from "@dto/${entityLower}/dto/create-${entityLower}.dto";
import type { Update${entityCapitalized}Dto } from "@dto/${entityLower}/dto/update-${entityLower}.dto";

export type ${entityCapitalized}FormDto = Create${entityCapitalized}Dto | Update${entityCapitalized}Dto;
`;
  return code;
}
