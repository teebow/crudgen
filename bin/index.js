// src/index.ts
import { Command } from "commander";
import { generateApp } from "../scripts/generate-app";
import { select } from "@inquirer/prompts";

const program = new Command();

program
  .name("crud-gen")
  .description(
    "Génère une application fullstack CRUD à partir d’un schema Prisma"
  )
  .argument("<prisma-schema-path>", "Chemin vers le fichier schema.prisma")
  .action(async (schemaPath) => {
    // const answer = await select({
    //   message: "Select the item type:",
    //   choices: [
    //     { name: "front", value: "front" },
    //     { name: "back", value: "back" },
    //     { name: "front and back", value: "fb" },
    //   ],
    // });

    // const { front = true, back = true } = answer
    //   ? { front: true, back: false }
    //   : answer === "back"
    //     ? { front: false, back: true }
    //     : { front: true, back: true };

    await generateApp(schemaPath, true, false);
  });

program.parse();
