import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Create a client
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<HeroUIProvider>
			<QueryClientProvider client={queryClient}>
				<main className="text-foreground bg-background">
					<App />
				</main>
			</QueryClientProvider>
		</HeroUIProvider>
	</React.StrictMode>
);
