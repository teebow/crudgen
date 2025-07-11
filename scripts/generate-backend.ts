import fs from "fs-extra";
import path from "node:path";
import { ChildProcess, execSync } from "node:child_process";
import { PrismaModel } from "./prisma-parser";
import ora from "ora";
import { copyConfigTemplate, copyFiles } from "./utils/copy-files";
import {
  addPrismaServiceToModule,
  updateDtoImportInFiles,
} from "./utils/update-file-content";
import { generatePrismaService } from "./backend/generate-prisma-service";
import { checkModelsHaveTimestampsColumns } from "./backend/validate-prisma-schema";
import { generateController } from "./backend/generate-controller";
import { generateService } from "./backend/generate-service";

export async function generateBackend(
  schemaPath: string,
  models: PrismaModel[],
  outputDir: string,
  sharedDir: string
) {
  const templateDir = path.join(__dirname, "..", "templates", "backend");
  fs.mkdirsSync(outputDir);
  process.chdir(outputDir);
  // 1. Crée le projet NestJS si non existant
  const spinner = ora("Création du projet Nest...").start();
  if (!fs.existsSync(path.join(outputDir, "package.json"))) {
    execSync(`bunx @nestjs/cli new .  --package-manager bun`, {
      stdio: "pipe",
    });
  }
  spinner.succeed("Projet Nestjs créé");

  // 2. Ajoute le module de configuration
  spinner.start("Ajout du module de configuration");
  updateAppModuleFilesToAddConfigModule(outputDir);
  spinner.succeed();

  // 3. Installe les dépendances nécessaires
  spinner.start("installation des dépendances Nest");
  execSync("bun add @nestjs/config", { stdio: "pipe" });
  execSync("bun install ", { stdio: "pipe" });
  spinner.succeed("Dépendances installées");

  // 4. Ajoute Prisma et génère les fichiers nécessaires
  spinner.start("installation de Prisma");
  execSync("bun add @prisma/client", { stdio: "pipe" });
  execSync("bun add @brakebein/prisma-generator-nestjs-dto prisma -d", {
    stdio: "pipe",
  });
  execSync("bun add zod-prisma-types -d", {
    stdio: "pipe",
  });
  spinner.succeed("Prisma installé");

  // 5. Installe PrismaService et module global
  spinner.start("Création du module Prisma");
  await updatePrismaSchemaAndGenerateDto(schemaPath);
  await setupPrismaModule();
  spinner.succeed("Module Prisma");

  // 6. Génère les ressources NestJS pour chaque entité
  spinner.start("Génération des ressources NestJS");
  await generateModulesAndControllers(models);
  spinner.succeed("Ressources générées");

  // 7. Copie les fichiers de configuration
  spinner.start("Copie des fichiers de configuration");
  await copyConfigTemplate(templateDir, outputDir);
  spinner.succeed("Fichiers de configuration copiés");

  // 7. Copie le main.tsx
  spinner.start("Copie des fichiers de configuration");
  await copyFiles(path.join(templateDir, "app"), path.join(outputDir, "src"));
  spinner.succeed("Fichiers de configuration copiés");

  // 7. Copie le main.tsx
  spinner.start("Copie des common dto from shared folder");
  const sharedTemplateDir = path.join(__dirname, "..", "templates", "shared");
  await copyFiles(path.join(sharedTemplateDir), path.join(sharedDir));
  spinner.succeed("Common DTOs copiés");

  //TODO voir avec docker si stop car ça ne devrait pas marcher, il faudrait lancer d'abord le conteneur
  spinner.start("Migration prisma");
  // execSync("bunx prisma migrate dev --name init --skip-seed", {
  //   stdio: "inherit",
  // });
  spinner.succeed("Migration prisma effectuée");
  // 8. Formate tous les fichiers
  spinner.start("Prettier");
  execSync("bunx prettier --write .");
  spinner.succeed();
}

async function updatePrismaSchemaAndGenerateDto(schemaPath: string) {
  if (!fs.existsSync("prisma")) fs.mkdirSync("prisma");

  const newSchemaPath = path.join("prisma", "schema.prisma");
  //const schemaContent = generatePrismaSchema(models);
  const nestjsDtoGenerator = `
  generator nestjsDto {
    provider                        = "prisma-generator-nestjs-dto"
    output                          = "../../shared/dto"
    prismaClientImportPath          = ""
    outputToNestJsResourceStructure = "true"
    flatResourceStructure           = "false"
    exportRelationModifierClasses   = "false"
    reExport                        = "false"
    generateFileTypes               = "all"
    createDtoPrefix                 = "Create"
    updateDtoPrefix                 = "Update"
    dtoSuffix                       = "Dto"
    entityPrefix                    = ""
    entitySuffix                    = ""
    classValidation                 = "false"
    fileNamingStyle                 = "camel"
    noDependencies                  = "true"
    outputType                      = "interface"
    definiteAssignmentAssertion     = "false"
    requiredResponseApiProperty     = "true"
    prettier                        = "true"
    wrapRelationsAsType             = "false"
    showDefaultValues               = "false"
  }

  generator zod {
    provider       = "zod-prisma-types"
    output         = "../../shared/zod"
    useMultipleFiles = true
    createInputTypes                 = false 
    createModelTypes                 = true 
    addInputTypeValidation           = false
    addIncludeType                   = false
    addSelectType                    = false
    validateWhereUniqueInput         = false
    createRelationValuesTypes       = true
  }
  `;

  await fs.copyFile(schemaPath, newSchemaPath);
  let schemaContent = await fs.readFile(newSchemaPath, "utf-8");
  try {
    checkModelsHaveTimestampsColumns(schemaContent);
  } catch (error) {
    console.error("Error validating Prisma schema:", error);
    throw error;
  }
  schemaContent = schemaContent.replace(
    /generator client \{\s*provider\s*=\s*"prisma-client-js"\s*\}/,
    `generator client {
    provider = "prisma-client-js"
  }
   ${nestjsDtoGenerator}`
  );
  await fs.writeFile(newSchemaPath, schemaContent, "utf-8");

  execSync("bunx prisma generate", { stdio: "pipe" });
}

async function generateModulesAndControllers(models: PrismaModel[]) {
  const entityNameLowerCase = (model: PrismaModel) => model.name.toLowerCase();
  for (const model of models) {
    const entityName = entityNameLowerCase(model);
    const filePath = (type: string) =>
      path.join("src", entityName, `${entityName}.${type}.ts`);
    await generateEntityModule(model);
    updateDtoImportInFiles(filePath("controller"), entityName);
    addPrismaServiceToModule(filePath("module"));
  }
}

async function setupPrismaModule() {
  const prismaServicePath = path.join("src", "prisma");
  await fs.ensureDir(prismaServicePath);
  execSync(`bunx nest g mo prisma --no-spec`, {
    stdio: "pipe",
  });

  await fs.writeFile(
    path.join(prismaServicePath, "prisma.service.ts"),
    generatePrismaService()
  );
}

async function generateEntityModule(model: PrismaModel) {
  const entityName = model.name;
  const nameLower = entityName.toLowerCase();
  const entityModulePath = path.join("src", nameLower);
  execSync(`bunx nest g resource ${entityName} --no-spec`, {
    stdio: "pipe",
  });

  await fs.ensureDir(entityModulePath);

  await fs.writeFile(
    path.join(entityModulePath, `${nameLower}.service.ts`),
    generateService(model)
  );

  await fs.writeFile(
    path.join(entityModulePath, `${nameLower}.controller.ts`),
    generateController(model)
  );
}

async function generateDTOs(model: PrismaModel) {
  const nameLower = model.name.toLowerCase();
  const dtoDir = path.join("src", nameLower, "dto");
  await fs.ensureDir(dtoDir);

  const createDto = model.fields
    .filter((f) => f.name !== "id")
    .map(
      (f) => `  ${f.name}${f.isOptional ? "?" : ""}: ${mapFieldType(f.type)};`
    )
    .join("\n");

  const updateDto = model.fields
    .filter((f) => f.name !== "id")
    .map((f) => `  ${f.name}?: ${mapFieldType(f.type)};`)
    .join("\n");

  const createContent = `export class Create${model.name}Dto {\n${createDto}\n}\n`;
  const updateContent = `export class Update${model.name}Dto {\n${updateDto}\n}\n`;

  await fs.writeFile(
    path.join(dtoDir, `create-${nameLower}.dto.ts`),
    createContent
  );
  await fs.writeFile(
    path.join(dtoDir, `update-${nameLower}.dto.ts`),
    updateContent
  );
}

function mapFieldType(type: string): string {
  switch (type.toLowerCase()) {
    case "int":
    case "float":
    case "decimal":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
    case "datetime":
      return "string";
    default:
      return "string";
  }
}

function updateAppModuleFilesToAddConfigModule(outputDir: string) {
  const appModulePath = path.join(outputDir, "src", "app.module.ts");
  let appModuleContent = fs.readFileSync(appModulePath, "utf-8");
  // Check if ConfigModule import is already present
  if (!appModuleContent.includes("ConfigModule")) {
    appModuleContent = appModuleContent.replace(
      "import { Module } from '@nestjs/common';",
      `import { Module } from '@nestjs/common';
      import { ConfigModule } from '@nestjs/config';`
    );
  }

  // Check if ConfigModule.forRoot() is already in the imports array
  const importsRegex = /imports\s*:\s*\[([^\]]*)\]/;
  const match = appModuleContent.match(importsRegex);
  if (match && !match[1].includes("ConfigModule.forRoot")) {
    appModuleContent = appModuleContent.replace(
      "imports: [",
      `imports: [
      ConfigModule.forRoot({
        isGlobal: true, // Make the config global
      }),`
    );
  }

  //write the updated content back to the file
  fs.writeFileSync(appModulePath, appModuleContent, "utf-8");
}
