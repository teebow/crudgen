import * as fs from "fs";
import * as path from "path";

/**
 * Updates import paths in a file, replacing `/dto/xxx` with `@dto/{entityName}/dto/xxx`.
 * @param filePath Path to the file to update.
 * @param entityName Name of the entity to use in the import path.
 */
export function updateFileContent(filePath: string, entityName: string): void {
  if (!filePath || !entityName) {
    throw new Error("Both filePath and entityName are required.");
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // Replace ./dto/xxx with @dto/{entityName}/dto/xxx
  const updatedContent = content.replace(
    /(['"`])\.\/dto\/([^'"]+)\1/g,
    (_match, quote, rest) => {
      return `${quote}@dto/${entityName}/dto/${rest}${quote}`;
    }
  );

  fs.writeFileSync(filePath, updatedContent, "utf-8");
}
