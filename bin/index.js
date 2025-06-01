// src/index.ts
import { Command } from 'commander';
import { generateApp } from '../scripts/generate-app'

const program = new Command();

program
  .name('crud-gen')
  .description('Génère une application fullstack CRUD à partir d’un schema Prisma')
  .argument('<prisma-schema-path>', 'Chemin vers le fichier schema.prisma')
  .action((schemaPath) => {
    generateApp(schemaPath);
  });

program.parse();
