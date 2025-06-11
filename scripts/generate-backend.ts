import fs from "fs-extra";
import path from "node:path";
import { ChildProcess, execSync } from "node:child_process";
import { PrismaModel } from "./prisma-parser";
import { pascalCase } from "change-case";
import ora from "ora";
import { copyConfigTemplate } from "./utils/copy-files";
import {
  addPrismaServiceToModule,
  updateDtoImportInFiles,
} from "./utils/update-file-content";

export async function generateBackend(
  schemaPath: string,
  models: PrismaModel[],
  outputDir: string
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
  spinner.succeed("Prisma installé");

  // 5. Installe PrismaService et module global
  spinner.start("Création du module Prisma");
  await updatePrismaSchemaAndGenerateDto(schemaPath);
  //execSync('bunx prisma migrate dev --name init --skip-seed', { stdio: 'inherit' });
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
    exportRelationModifierClasses   = "true"
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
    outputType                      = "class"
    definiteAssignmentAssertion     = "false"
    requiredResponseApiProperty     = "true"
    prettier                        = "true"
    wrapRelationsAsType             = "false"
    showDefaultValues               = "false"
  }
  `;

  await fs.copyFile(schemaPath, newSchemaPath);
  let schemaContent = await fs.readFile(newSchemaPath, "utf-8");
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

  const serviceContent = `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
`;

  await fs.writeFile(
    path.join(prismaServicePath, "prisma.service.ts"),
    serviceContent
  );
  // await fs.writeFile(
  //   path.join(prismaServicePath, "prisma.module.ts"),
  //   moduleContent
  // );
}

async function generateEntityModule(model: PrismaModel) {
  const entityName = model.name;
  const nameLower = entityName.toLowerCase();
  const entityModulePath = path.join("src", nameLower);
  execSync(`bunx nest g resource ${entityName} --no-spec`, {
    stdio: "pipe",
  });

  await fs.ensureDir(entityModulePath);

  const serviceContent = `import { Injectable } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { Prisma } from '@prisma/client';
  
  @Injectable()
  export class ${entityName}Service {
    constructor(private prisma: PrismaService) {}
  
    findAll() {
      return this.prisma.${nameLower}.findMany();
    }
  
    findOne(id: number) {
      return this.prisma.${nameLower}.findUnique({ where: { id } });
    }
  
    create(data: Prisma.${entityName}CreateInput) {
      return this.prisma.${nameLower}.create({ data });
    }
  
    update(id: number, data: Prisma.${entityName}UpdateInput) {
      return this.prisma.${nameLower}.update({ where: { id }, data });
    }
  
    remove(id: number) {
      return this.prisma.${nameLower}.delete({ where: { id } });
    }
  }
  `;

  await fs.writeFile(
    path.join(entityModulePath, `${nameLower}.service.ts`),
    serviceContent
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
