import fs from "fs-extra";
import path from "path";
import { PrismaModel, prismaModelToFormSchema } from "./prisma-parser";
import { pascalCase, camelCase } from "change-case";
import { execSync } from "node:child_process";
import Handlebars from "handlebars";
import { mapFieldType } from "./utils/map-field-type";
import ora, { Ora, spinners } from "ora";
import generateForm from "./frontend/generate-inputs";

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

  withSpinner("Création avec create vite", createViteApp)();
  withSpinner("Installation des dépendances", installDependencies)();
  withSpinner("Génération des composants crud", generateCRUDComponenst)(
    templateDir,
    frontendPath,
    models
  );
  withSpinner("Création du fichier api-client", copyApiFileTemplate)(
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
  // execSync(`bun add daisyui@latest -d`, {
  //   stdio: "inherit",
  // });

  
  execSync(`bun add axios`, {
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
      const { imports, formFields } = generateForm(
        prismaModelToFormSchema(model)
      );
       const output = compiled({
        modelName,
        modelVar,
        imports,
        formFields,
      });
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

      await fs.writeFile(path.join(modelDir, `${template}.tsx`), output);
    }
  }
}

function copyApiFileTemplate(templateDir: string, frontendPath: string) {
  const templateApiPath = path.join(templateDir, "api");
  const outputCoreDirectory = path.join(frontendPath, "src/core/api/");

  fs.ensureDirSync(outputCoreDirectory);
  fs.copyFileSync(
    path.join(templateApiPath, "api-client.ts"),
    path.join(outputCoreDirectory, "api-client.ts")
  );
}
