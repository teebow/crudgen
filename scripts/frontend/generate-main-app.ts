import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generateMainApp(
  models: PrismaModel[],
  content: (componentsImport: string, routes: string) => string
): string {
  const routes = models
    .map((model) => {
      // This function generates the route code for each model.
      const modelName = pascalCase(model.name);
      const modelNameLower = model.name.toLowerCase();
      return `<Route path="/${modelNameLower}" element={<${modelName}Page />} />`;
    })
    .join("\n");

  const componentsImport = models
    .map((model) => {
      // This function generates the import statement for each model's page component.
      const modelName = pascalCase(model.name);
      const modelNameLower = model.name.toLowerCase();
      return `import ${modelName}Page  from './${modelNameLower}/${modelName}Page';`;
    })
    .join("\n");

  return content(componentsImport, routes);
}
