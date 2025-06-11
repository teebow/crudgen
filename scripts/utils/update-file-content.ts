import * as fs from "fs";

/**
 * Updates import paths in a file, replacing `/dto/xxx` with `@dto/{entityName}/dto/xxx`.
 * @param filePath Path to the file to update.
 * @param entityName Name of the entity to use in the import path.
 */
export function updateDtoImportInFiles(
  filePath: string,
  entityName: string
): void {
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

/**
 * Adds PrismaService to the providers array in a NestJS module file and ensures the correct import.
 * @param filePath Path to the module file to update.
 */
export function addPrismaServiceToModule(filePath: string): void {
    if (!filePath) {
        throw new Error("filePath is required.");
    }

    const content = fs.readFileSync(filePath, "utf-8");

    // Add PrismaService import if not present
    let updatedContent = content;
    if (!/import\s*\{\s*PrismaService\s*\}/.test(content)) {
        // Try to find the last import statement
        const importStatement = `import { PrismaService } from 'src/prisma/prisma.service';\n`;
        updatedContent = updatedContent.replace(
            /((?:import[\s\S]+?from\s+['"][^'"]+['"];\s*)+)/,
            `$1${importStatement}`
        );
    }

    // Add PrismaService to providers array if not present
    updatedContent = updatedContent.replace(
        /(providers\s*:\s*\[)([\s\S]*?)(\])/,
        (match, start, middle, end) => {
            if (/PrismaService/.test(middle)) {
                return match; // Already present
            }
            // Add PrismaService, handling trailing commas and whitespace
            const trimmed = middle.trim();
            if (trimmed === "") {
                return `${start}PrismaService${end}`;
            }
            return `${start}${middle.replace(/\s*$/, "")}, PrismaService${end}`;
        }
    );

    fs.writeFileSync(filePath, updatedContent, "utf-8");
}