

import { getDMMF } from "@prisma/internals";
import fs from "node:fs/promises";
import path from "node:path";

export type PrismaField = {
  name: string;
  type: string;
  isOptional: boolean;
  isList: boolean;
};

export type PrismaModel = {
  name: string;
  fields: PrismaField[];
};

// async () => {
//   const models = await extractModels('./prisma/schema.prisma');
//   console.log(models);
// }

export async function extractModels(
  schemaPath: string
): Promise<PrismaModel[]> {
  const fullPath = path.resolve(schemaPath);
  const schemaContent = await fs.readFile(fullPath, "utf-8");
  const dmmf = await getDMMF({ datamodel: schemaContent });

  const models: PrismaModel[] = dmmf.datamodel.models.map((model) => ({
    name: model.name,
    fields: model.fields.map((field) => ({
      name: field.name,
      type: field.type,
      isOptional: !field.isRequired,
      isList: field.isList,
    })),
  }));

  return models;
}
