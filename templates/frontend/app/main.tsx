import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
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
      toast.error("Erreur", {
        description: error.message,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Modification enregistrée");
    },
  }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
