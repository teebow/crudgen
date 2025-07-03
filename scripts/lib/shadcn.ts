import { execSync } from "child_process";

/**
 * Installs all dependencies required for shadcn/ui in a Vite + React project.
 */
export function installShadcnDeps() {
  console.log("Installing shadcn/ui dependencies...");
  execSync(`bun add tailwindcss @tailwindcss/vite`, { stdio: "inherit" });
  console.log(
    "Installing Vite, React, Tailwind CSS and related dev dependencies..."
  );
  execSync(`bun add -D @types/node`, { stdio: "inherit" });
  execSync(`bunx --bun shadcn@latest init -b stone`, { stdio: "inherit" });
  console.log("All shadcn/ui dependencies for Vite installed.");
}
