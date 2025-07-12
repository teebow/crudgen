// src/index.ts
import { Command } from "commander";
import { generateApp } from "../scripts/generate-app";
import inquirer from "inquirer";

const program = new Command();

program
  .name("crud-gen")
  .description(
    "Génère une application fullstack CRUD à partir d’un schema Prisma"
  )
  .argument("<prisma-schema-path>", "Chemin vers le fichier schema.prisma")
  .action(async (schemaPath) => {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Select the item type:",
        choices: ["front", "back", "front and back"],
      },
    ]);
    const { front = true, back = true } =
      answers.type === "front"
        ? { front: true, back: false }
        : answers.type === "back"
          ? { front: false, back: true }
          : { front: true, back: true };

    await generateApp(schemaPath, front, back);
  });

program.parse();
