import { execSync } from "child_process";

/**
 * Installs all dependencies required for shadcn/ui in a Vite + React project.
 */
export function installShadcnDeps() {
    const deps = [
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "tailwind-merge",
        "tailwindcss-animate"
    ];
    const devDeps = [
        "vite",
        "react",
        "react-dom",
        "tailwindcss",
        "postcss",
        "autoprefixer"
    ];

    console.log("Installing shadcn/ui dependencies...");
    execSync(`bun add tailwindcss @tailwindcss/vite`, { stdio: "inherit" });
    console.log("Installing Vite, React, Tailwind CSS and related dev dependencies...");
    execSync(`npm install -D ${devDeps.join(" ")}`, { stdio: "inherit" });
    console.log("All shadcn/ui dependencies for Vite installed.");
}