import { FormField } from "../frontend/generate-inputs";

export const columnsToIgnore = ["createdAt", "deletedAt", "updatedAt"];

export function ignoreDefaultDateFields(fields: FormField[]): FormField[] {
  return fields.filter(
    (field) =>
      !columnsToIgnore.includes(field.name) &&
      !field.name.startsWith("id") &&
      !field.name.endsWith("Id")
  );
}
