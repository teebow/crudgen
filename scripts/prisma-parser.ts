import { getDMMF } from "@prisma/internals";
import fs from "node:fs/promises";
import path from "node:path";
import { FormSchema, FormField } from "./frontend/generate-inputs";

export type PrismaField = {
  name: string;
  type: string;
  isOptional: boolean;
  isList: boolean;
  isRelation: boolean;
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
      isRelation: field.relationName != undefined,
    })),
  }));
  return models;
}

export function prismaModelToFormSchema(model: PrismaModel): FormSchema {
  return {
    title: model.name,
    fields: model.fields
      .filter((f) => f.name !== "id")
      .map<FormField>((f) => ({
        name: f.name,
        label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
        type: mapPrismaTypeToFormType(f.type) + (f.isList ? "[]" : ""),
        required: !f.isOptional,
        isRelation: f.isRelation,
      })),
    submitButtonText: "Submit",
  };
}

function mapPrismaTypeToFormType(type: string): string {
  switch (type.toLowerCase()) {
    case "int":
    case "float":
    case "decimal":
      return "number";
    case "boolean":
      return "checkbox";
    case "date":
    case "datetime":
      return "date";
    case "string":
      return "text";
    default:
      return type;
  }
}
