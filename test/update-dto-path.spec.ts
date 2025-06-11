import { fs } from "memfs";
import { updateDtoImportInFiles } from "../scripts/utils/update-file-content";

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";

vi.mock("node:fs");

describe("updateFileContent", () => {
  const mockFilePath = "/tmp/test-file.ts";
  const entityName = "user";
  const originalContent = `
        // unrelated import
    `;
  let writtenContent = "";

  beforeEach(() => {
    (fs.readFileSync as unknown as Mock).mockImplementation(
      () => originalContent
    );
    (fs.writeFileSync as unknown as Mock).mockImplementation(
      (_file, content) => {
        writtenContent = content;
      }
    );
    writtenContent = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throws if filePath or entityName is missing", () => {
    expect(() => updateDtoImportInFiles("", entityName)).toThrow();
    expect(() => updateDtoImportInFiles(mockFilePath, "")).toThrow();
  });

  it("replaces /dto/ imports with @dto/{entityName}/dto/", () => {
    updateDtoImportInFiles(mockFilePath, entityName);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, "utf-8");
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockFilePath,
      expect.any(String),
      "utf-8"
    );

    expect(writtenContent).toContain(`from '@dto/user/dto/something'`);
    expect(writtenContent).toContain(`from "@dto/user/dto/another"`);
    expect(writtenContent).toContain(`from \"@dto/user/dto/third\"`);
    expect(writtenContent).toContain(`from './notdto/whatever'`);
  });

  it("does not replace unrelated import paths", () => {
    updateDtoImportInFiles(mockFilePath, entityName);
    expect(writtenContent).toContain(`from './notdto/whatever'`);
  });

  it("handles files with no /dto/ imports gracefully", () => {
    (fs.readFileSync as unknown as Mock).mockImplementation(
      () => `import x from './foo';`
    );
    updateDtoImportInFiles(mockFilePath, entityName);
    expect(writtenContent).toBe(`import x from './foo';`);
  });
});
