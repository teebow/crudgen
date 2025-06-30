import React from "react";
import ReactDOM from "react-dom/client";
import { addToast, HeroUIProvider, ToastProvider } from "@heroui/react";
import App from "./App.tsx";
import "./index.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
// Create a client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      addToast({
        title: "Erreur",
        description: error.message,
        color: "danger",
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      addToast({
        title: "Erreur",
        description: error.message,
        color: "danger",
      });
    },
    onSuccess: () => {
      addToast({
        title: "Modification enregistrée",
        color: "success",
      });
    },
  }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <QueryClientProvider client={queryClient}>
        <main className="text-foreground bg-background">
          <App />
        </main>
      </QueryClientProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
