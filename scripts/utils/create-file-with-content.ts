import fs from "fs-extra";
import path from "path";

export async function writeContentToFile(
  content: string,
  dir: string,
  fileName: string
) {
  await fs.ensureDir(dir);
  // Write the sidebar component
  await fs.writeFile(path.join(dir, fileName), content);
}
