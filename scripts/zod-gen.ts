import fs from "fs";
import path from "path";
import { getDMMF } from "@prisma/internals";
import { EnumValue, Model } from "@prisma/dmmf";
import { kebabCase } from "change-case";
import { columnsToIgnore } from "./utils/ignore-field";

const scalarMap: Record<string, string> = {
  String: "z.string()",
  Int: "z.number().int()",
  Float: "z.number()",
  Boolean: "z.boolean()",
  DateTime: "z.date()",
  Json: "z.any()",
  BigInt: "z.bigint()",
  Bytes: "z.instanceof(Buffer)",
  Decimal: "z.string()",
};

const optional = (zod: string, isOptional: boolean, isId: boolean) => {
  if (isOptional && !isId) zod += ".nullable()";
  if (isOptional) zod += ".optional()";
  else zod += ".nonempty()";
  return zod;
};

function prismaToZodSchema(model: Model, enums: any[]) {
  const base: string[] = [];
  const create: string[] = [];
  const update: string[] = [];

  for (const field of model.fields) {
    // Handle enums
    if (field.kind === "enum") {
      const enumDef = enums.find((e) => e.name === field.type);
      if (enumDef) {
        const z = `z.enum([${enumDef.values.map((v: EnumValue) => `"${v.name}"`).join(", ")}])`;
        base.push(
          `  ${field.name}: ${optional(z, !field.isRequired, field.isId)},`
        );
        if (!field.hasDefaultValue && !field.isId && !field.isUpdatedAt) {
          create.push(
            `  ${field.name}: ${optional(z, !field.isRequired, field.isId)},`
          );
        }
        update.push(
          `  ${field.name}: ${optional(z, !field.isRequired, field.isId)},`
        );
      }
      continue;
    }
    if (field.kind === "object" && field.relationName) {
      if (field.isList) {
        // Many relation → z.array(z.number().int()).optional()
        const relatedIdType = "Int"; // default fallback
        const z = `z.array(${scalarMap[relatedIdType] || "z.any()"}).optional()`;
        base.push(`  ${field.name}: ${z},`);
        create.push(`  ${field.name}: ${z},`);
        update.push(`  ${field.name}: ${z},`);
      }
      continue;
    }

    if (field.kind !== "scalar") continue;

    const z = optional(
      scalarMap[field.type] || "z.any()",
      (!field.isRequired || field.hasDefaultValue || field.isUpdatedAt) &&
        !field.isId,
      field.isId
    );
    base.push(`  ${field.name}: ${z},`);
    if (!field.hasDefaultValue && !columnsToIgnore.includes(field.name)) {
      if (!field.isId) {
        create.push(`  ${field.name}: ${z},`);
      }
      update.push(`  ${field.name}: ${z},`);
    }
  }

  return {
    base: `
    export const ${model.name}Schema = z.object({\n${base.join("\n")}\n});\n 
    export type ${model.name}Dto = z.infer<typeof ${model.name}Schema>;
    \n`,
    create: `
    export const Create${model.name}Schema = z.object({\n${create.join("\n")}\n});\n
    export type Create${model.name}Dto = z.infer<typeof Create${model.name}Schema>;
    \n`,
    update: `
    export const Update${model.name}Schema = z.object({\n${update.join("\n")}\n});\n
    export type Update${model.name}Dto = z.infer<typeof Update${model.name}Schema>;
    \n`,
    paginate: `
    
    export const Paginated${model.name}sSchema = createPaginatedResultSchema(${model.name}Schema);
    export type Paginated${model.name}sDto = z.infer<typeof Paginated${model.name}sSchema>;
    
    `,
  };
}

export async function generateZodSchema(schemaPath: string, outputDir: string) {
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Missing schema.prisma at ${schemaPath}`);
    process.exit(1);
  }

  const datamodel = fs.readFileSync(schemaPath, "utf-8");
  const dmmf = await getDMMF({ datamodel });
  const models = dmmf.datamodel.models;
  const enums = dmmf.datamodel.enums;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  for (const model of models) {
    const { base, create, update } = prismaToZodSchema(model, enums);
    const content = [
      `
      import { z } from 'zod';
      import { createPaginatedResultSchema } from "./common/query.schema";`,
      "",
      base,
      "",
      create,
      "",
      update,
      "",
    ].join("\n");

    fs.writeFileSync(
      path.join(outputDir, `${kebabCase(model.name)}.schema.ts`),
      content
    );
    console.log(`✅ ${model.name} schema generated`);
  }
}
