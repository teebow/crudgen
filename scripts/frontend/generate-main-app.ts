import { pascalCase } from "change-case";
import { PrismaModel } from "../prisma-parser";

export function generateMainApp(models: PrismaModel[]): string {
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

  // This function generates the main application code for a React app with a collapsible sidebar.
  const code = `import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
${componentsImport}

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen bg-background text-foreground">
        <CollapsibleSidebar />
        <main className="flex-1 p-4 overflow-auto">
          <Routes>
            ${routes}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;`;
  return code;
}
