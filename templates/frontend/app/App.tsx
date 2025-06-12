import { HeroUIProvider } from "@heroui/react";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>CONTENT</HeroUIProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;


