import { execSync } from "child_process";
import { PrismaModel } from "../prisma-parser";
import { pascalCase } from "change-case";

/**
 * Installs all dependencies required for shadcn/ui in a Vite + React project.
 */
export function installShadcnDeps() {
  console.log("Installing shadcn/ui dependencies...");

  execSync(`bun add tailwindcss @tailwindcss/vite`, { stdio: "inherit" });
  try {
    execSync(`bun pm trust @tailwindcss/oxide`, { stdio: "inherit" });
    execSync(`bun pm trust esbuild`, { stdio: "inherit" });
  } catch (e) {
    console.error(e);
  }

  console.log(
    "Installing Vite, React, Tailwind CSS and related dev dependencies..."
  );
  execSync(`bun add -D @types/node`, { stdio: "inherit" });
  execSync(`bunx --bun shadcn@latest init`, { stdio: "inherit" });

  // Install shadcn/ui components
  execSync(`bunx --bun shadcn@latest add -a --yes --silent`);

  execSync(`bun add @tanstack/react-table`);

  console.log("All shadcn/ui dependencies for Vite installed.");
}

export function generateMenuData(models: PrismaModel[]) {
  // generate entities object base on models with the shape  name: "Design Engineering",url: "#", icon: Frame
  const entities = models
    .map(
      (model) => `{
    name: '${pascalCase(model.name)}',
    url: '/${model.name.toLowerCase()}',
    icon: Send,
  }`
    )
    .join(",\n");

  const code = `import { Send, LifeBuoy } from "lucide-react";

  export const menuData = {
    user: {
      name: "tibal",
      email: "m@example.com",
    },
    navsecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    entities : [${entities}]
  };`;

  return code;
}

export function shadcnMainAppContent(componentsImport: string, routes: string) {
  return `import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider";
import { DataProvider } from "./core/context/DataProvider";
import Layout from "./Layout";
import { menuData } from "./MenuData";
${componentsImport}

const App: React.FC = () => {
  return (
  <DataProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Layout user={menuData.user} navsecondary={menuData.navsecondary} entities={menuData.entities} >
            <Router>
              <Routes>
                ${routes}
              </Routes>
             </Router>
          </Layout>
        </ThemeProvider>
  </DataProvider>
  );
};

export default App;`;
}
