import path from "node:path";
import { extractModels } from "./prisma-parser";
import { generateFrontend } from "./generate-frontend";
import { generateBackend } from "./generate-backend";
import ora from "ora";
import chalk from "chalk";

export async function generateApp(schemaPath: string) {
  const spinner = ora("Lecture du schéma Prisma...").start();

  try {
    const models = await extractModels(schemaPath);
    spinner.succeed("Modèles Prisma extraits.");

    const baseDir = process.cwd();
    const frontendDir = path.join(baseDir, "generated/app-frontend");
    const backendDir = path.join(baseDir, "generated/app-backend");

    // spinner.start("Génération du backend NestJS...");
    // await generateBackend(schemaPath,models, backendDir);
    // spinner.succeed(chalk.green("Backend généré."));

    spinner.start("Génération du frontend React...");
    await generateFrontend(models, frontendDir);
    spinner.succeed(chalk.green("Frontend généré."));

    console.log(chalk.blueBright("\n🎉 Génération terminée avec succès !"));
    console.log(chalk.gray("➡️ Backend :"), backendDir);
    console.log(chalk.gray("➡️ Frontend :"), frontendDir);
  } catch (err) {
    spinner.fail(chalk.red("Erreur lors de la génération :"));
    console.error(err);
    process.exit(1);
  }
}
