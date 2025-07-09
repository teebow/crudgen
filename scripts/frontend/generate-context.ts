import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generateDataContex(models: PrismaModel[]): string {
  const dataContextType = models
    .map((model) => {
      // This function generates the route code for each model.
      const modelName = pascalCase(model.name);
      const modelNameLower = model.name.toLowerCase();
      return ` ${modelNameLower}: ReturnType<typeof useApi>;`;
    })
    .join("\n");

  // This function generates a React component for a form based on the entity name.
  const code = ` 
import { createContext } from "react";
import type { useApi } from "../api/use-api";

export type DataContextType = {
 ${dataContextType}
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

`;
  return code;
}
