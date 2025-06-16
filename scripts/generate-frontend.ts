import fs from "fs-extra";
import path from "path";
import { PrismaModel, prismaModelToFormSchema } from "./prisma-parser";
import { pascalCase, camelCase } from "change-case";
import { execSync } from "node:child_process";
import Handlebars from "handlebars";
import ora from "ora";
import generateForm from "./frontend/generate-inputs";
import { copyConfigTemplate, copyFiles } from "./utils/copy-files";
import { generatePageCode } from "./frontend/generate-page";
import { generateMainApp } from "./frontend/generate-main-app";
import { generateSidebar } from "./frontend/generate-sidebar";
import { generateList } from "./frontend/generate-list";
import { generateDataContex } from "./frontend/generate-context";
import { writeContentToFile } from "./utils/create-file-with-content";
import { generateDataProvider } from "./frontend/generate-data-provider";

//todo tester
export async function generateFrontend(
  models: PrismaModel[],
  outputDir: string
) {
  const spinner = ora("Création du projet Frontend...").start();
  await fs.ensureDir(outputDir);
  process.chdir(outputDir);
  const frontendPath = outputDir;
  const templateDir = path.join(__dirname, "..", "templates", "frontend");

  const withSpinner = (message: string, fn: Function) => {
    return async (...args: any) => {
      spinner.start(message);
      const result = await fn(...args);
      spinner.succeed();
      return result;
    };
  };

  await withSpinner("Création avec create vite", createViteApp)();
  await withSpinner("Installation des dépendances", installDependencies)();
  await withSpinner("Génération des composants crud", generateCRUDComponenst)(
    templateDir,
    frontendPath,
    models
  );

  //update config files and copy templates
  await withSpinner("Copie des fichiers de configuration", copyConfigTemplate)(
    templateDir,
    frontendPath
  );
  await withSpinner("Copie des fichiers App et index.css", copyFiles)(
    path.join(templateDir, "app"),
    path.join(frontendPath, "src")
  );

  await withSpinner("Création du fichier api-client", copyFiles)(
    path.join(templateDir, "api"),
    path.join(frontendPath, "src/core/api/")
  );

  await withSpinner("Copie use-data hook", copyFiles)(
    path.join(templateDir, "context"),
    path.join(frontendPath, "src/core/context/")
  );

  await withSpinner("Copie utils folder", copyFiles)(
    path.join(templateDir, "utils"),
    path.join(frontendPath, "src/utils")
  );
  
  await writeContentToFile(
    generateDataContex(models),
    path.join(frontendPath, "src/core/context"),
    "DataContext.tsx"
  );

  await writeContentToFile(
    generateDataProvider(models),
    path.join(frontendPath, "src/core/context"),
    "DataProvider.tsx"
  );

  await writeContentToFile(
    generateSidebar(models),
    path.join(frontendPath, "src/components"),
    "CollapsibleSidebar.tsx"
  );

  await writeContentToFile(
    generateMainApp(models),
    path.join(frontendPath, "src"),
    "App.tsx"
  );

  console.log("✅ Composants CRUD frontend générés avec succès.");
}

function createViteApp() {
  execSync(`bun create vite . --template react-ts`, {
    stdio: "inherit",
  });
}

function installDependencies() {
  const deps = [
    "react-hook-form",
    "react-router-dom",
    "axios",
    "@heroui/react",
    "framer-motion",
    "@react-aria/i18n",
    "@tanstack/react-query",
    "@internationalized/date",
  ];
  execSync(`bun add ${deps.join(" ")}`, {
    stdio: "inherit",
  });

  const devDeps = [
    "tailwindcss@^3",
    "postcss@^8",
    "autoprefixer@^10",
    "@iconify/react",
  ];
  execSync(`bun add ${devDeps.join(" ")} -d`, {
    stdio: "inherit",
  });
}

async function generateCRUDComponenst(
  templateDir: string,
  frontendPath: string,
  models: PrismaModel[]
) {
  const pagesPath = path.join(frontendPath, "src");

  await fs.ensureDir(pagesPath);
  //const templates = ["List", "Create", "Update", "Delete"];
  const templates = ["Form"];

  const templateUi = path.join(templateDir, "ui");

  for (const model of models) {
    const modelName = pascalCase(model.name);
    const modelVar = camelCase(model.name);
    const modelDir = path.join(pagesPath, modelVar);
    const formSchema = prismaModelToFormSchema(model);
    await fs.ensureDir(modelDir);
    const form = generateForm(formSchema);
    await fs.writeFile(path.join(modelDir, `${modelName}Form.tsx`), form);
    const page = generatePageCode(model.name, form);
    await fs.writeFile(path.join(modelDir, `${modelName}Page.tsx`), page);
    const list = generateList(model.name, formSchema);
    await fs.writeFile(path.join(modelDir, `${modelName}List.tsx`), list);
  }
}
