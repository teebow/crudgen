import { FormField } from "../frontend/generate-inputs";

const defaultDateColumn = ["createdAt", "deletedAt", "updatedAt"];

export function ignoreDefaultDateFields(fields: FormField[]): FormField[] {
  return fields.filter((field) => !defaultDateColumn.includes(field.name));
}
