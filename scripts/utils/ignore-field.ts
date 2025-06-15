const defaultDateColumn = ["createdAt", "deletedAt", "updatedAt"];

export function ignoreDefaultDateFields(fields: string[]): string[] {
    return fields.filter(field => !defaultDateColumn.includes(field));
}