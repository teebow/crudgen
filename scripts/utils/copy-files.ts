import fs from "fs-extra";
import path from "path";

export async function copyConfigTemplate(templateDir: string, appPath: string) {
  const templateConfigPath = path.join(templateDir, "config");
  await fs.ensureDir(appPath);
  const files = await fs.readdir(templateConfigPath);
  await Promise.all(
    files.map((file) =>
      fs.copy(path.join(templateConfigPath, file), path.join(appPath, file))
    )
  );
}

export async function copyFiles(dirSrc: string, dirDest: string) {
  await fs.ensureDir(dirDest);
  await fs.copy(dirSrc, dirDest);
}
