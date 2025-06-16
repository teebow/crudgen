import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generateDataProvider(models: PrismaModel[]): string {
  const typeDtoImports = models
    .map((model) => {
      // This function generates the route code for each model.
      const modelName = pascalCase(model.name);
      const modelNameLower = model.name.toLowerCase();
      return `import type { ${modelName}Dto } from "@dto/${modelNameLower}/dto/${modelNameLower}.dto";`;
    })
    .join("\n");

    const useApiForEntity =  models
    .map((model) => {
      // This function generates the route code for each model.
      const modelName = pascalCase(model.name);
      const modelNameLower = model.name.toLowerCase();
      return `const ${modelNameLower} = useApi<${modelName}Dto>("${modelNameLower}");`;
    })
    .join("\n");

    const entitiesValue = models.map(model => model.name.toLowerCase()).join(',')

  // This function generates a React component for a form based on the entity name.
  const code = ` 
import { useApi } from "../api/use-api";
import { DataContext } from "./DataContext";
import type { PropsWithChildren } from "react";

${typeDtoImports}

export const DataProvider = ({ children }: PropsWithChildren) => {
  ${useApiForEntity}

  return (
    <DataContext.Provider value={{${entitiesValue}}}>
      {children}
    </DataContext.Provider>
  );
};
`;
  return code;
}
