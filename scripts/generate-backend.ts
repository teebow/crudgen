import fs from "fs-extra";
import path from "node:path";
import { ChildProcess, execSync } from "node:child_process";
import { PrismaModel } from "./prisma-parser";
import { pascalCase } from "change-case";
import ora from "ora";

export async function generateBackend(
  schemaPath: string,
  models: PrismaModel[],
  outputDir: string
) {
  fs.mkdirsSync(outputDir);
  // 1. Crée le projet NestJS si non existant
  const spinner = ora("Création du projet Nest...").start();
  if (!fs.existsSync(path.join(outputDir, "package.json"))) {
    execSync(
      `bunx @nestjs/cli new ${path.basename(outputDir)}  --package-manager bun`,
      {
        stdio: "pipe",
      }
    );
  }
  spinner.succeed("Projet Nestjs créé");
  spinner.start("installation des dépendances Nest");
  process.chdir(outputDir);
  execSync("bun install", {
    stdio: "pipe",
  });
  spinner.succeed("Dépendances installées");
  // 2. Ajoute Prisma et génère les fichiers nécessaires
  spinner.start("installation de Prisma");
  execSync("bun add @prisma/client", { stdio: "pipe" });
  execSync("bun add prisma -d", { stdio: "pipe" });
  spinner.succeed("Prisma installé");
  spinner.start("Création du module Prisma");
  if (!fs.existsSync("prisma")) fs.mkdirSync("prisma");

  const newSchemaPath = path.join("prisma", "schema.prisma");
  //const schemaContent = generatePrismaSchema(models);
  await fs.copyFile("../" + schemaPath, newSchemaPath);

  //execSync('bunx prisma generate', { stdio: 'inherit' });
  //execSync('bunx prisma migrate dev --name init --skip-seed', { stdio: 'inherit' });

  // 3. Installe PrismaService et module global
  await setupPrismaModule();
  spinner.succeed("Module Prisma");
  // 4. Génère un resource par modèle

  spinner.start("Génération des modules et Dto");
  for (const model of models) {
    await generateEntityModule(model);
    await generateDTOs(model);
  }
  spinner.succeed("Module et dto");
}

function generatePrismaSchema(models: PrismaModel[]): string {
  const header = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

  const body = models
    .map((model) => {
      const fields = model.fields
        .map((f) => {
          const optional = f.isOptional ? "?" : "";
          const list = f.isList ? "[]" : "";
          return `  ${f.name} ${f.type}${list}${optional}`;
        })
        .join("\n");

      return `model ${model.name} {
${fields}
}`;
    })
    .join("\n\n");

  return `${header}\n${body}`;
}

async function setupPrismaModule() {
  const prismaServicePath = path.join("src", "prisma");
  await fs.ensureDir(prismaServicePath);

  const serviceContent = `import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
`;
  const moduleContent = `import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
`;

  await fs.writeFile(
    path.join(prismaServicePath, "prisma.service.ts"),
    serviceContent
  );
  await fs.writeFile(
    path.join(prismaServicePath, "prisma.module.ts"),
    moduleContent
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
