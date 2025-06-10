import fs from "fs-extra";
import path from "path";

export async function copyConfigTemplate(templateDir: string, appPath: string) {
  const templateConfigPath = path.join(templateDir, "config");
  await fs.ensureDir(appPath);
  const files = await fs.readdir(templateConfigPath);
  await Promise.all(
    files.map(file =>
      fs.copy(
        path.join(templateConfigPath, file),
        path.join(appPath, file)
      )
    )
  );
}
