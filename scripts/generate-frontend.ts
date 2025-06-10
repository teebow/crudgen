import fs from "fs-extra";
import path from "path";
import { PrismaModel, prismaModelToFormSchema } from "./prisma-parser";
import { pascalCase, camelCase } from "change-case";
import { execSync } from "node:child_process";
import Handlebars from "handlebars";
import ora from "ora";
import generateForm from "./frontend/generate-inputs";
import { copyConfigTemplate } from "./utils/copy-files";

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
  await withSpinner(
    "Copie des fichiers App et index.css",
    copyAppAndIndexCssTemplate
  )(templateDir, frontendPath);
  await withSpinner("Création du fichier api-client", copyApiFileTemplate)(
    templateDir,
    frontendPath
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
    "axios",
    "@heroui/react",
    "lucide-react",
    "framer-motion",
    "@react-aria/i18n",
    "@tanstack/react-query",
    "@internationalized/date",
  ];
  execSync(`bun add ${deps.join(" ")}`, {
    stdio: "inherit",
  });

  const devDeps = ["tailwindcss@^3", "postcss@^8", "autoprefixer@^10"];
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
    const modelDir = path.join(pagesPath, modelName);
    await fs.ensureDir(modelDir);

    for (const template of templates) {
      const templatePath = path.join(templateUi, `${template}.hbs`);
      const templateContent = await fs.readFile(templatePath, "utf-8");
      const compiled = Handlebars.compile(templateContent);
      const form = generateForm(prismaModelToFormSchema(model));

      // const output = compiled({
      //   modelName,
      //   modelVar,
      //   fields: model.fields
      //     .filter((f: { name: string }) => f.name !== "id")
      //     .map((f: { name: any; type: string; isOptional: any }) => ({
      //       name: f.name,
      //       type: mapFieldType(f.type),
      //       required: !f.isOptional,
      //     })),
      // });

      await fs.writeFile(path.join(modelDir, `${template}.tsx`), form);
    }
  }
}

async function copyApiFileTemplate(templateDir: string, frontendPath: string) {
  const templateApiPath = path.join(templateDir, "api");
  const outputCoreDirectory = path.join(frontendPath, "src/core/api/");
  await fs.ensureDir(outputCoreDirectory);
  await fs.copy(
    path.join(templateApiPath, "api-client.ts"),
    path.join(outputCoreDirectory, "api-client.ts")
  );
}

async function copyAppAndIndexCssTemplate(
  templateDir: string,
  frontendPath: string
) {
  const templateAppPath = path.join(templateDir, "app");
  const outputAppDirectory = path.join(frontendPath, "src");
  await fs.ensureDir(outputAppDirectory);
  await Promise.all([
    fs.copy(
      path.join(templateAppPath, "App.tsx"),
      path.join(outputAppDirectory, "App.tsx")
    ),
    fs.copy(
      path.join(templateAppPath, "index.css"),
      path.join(outputAppDirectory, "index.css")
    ),
  ]);
}
