export function mapFieldType(type: string): string {
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
