import { HeroUIProvider } from "@heroui/react";
import "./App.css";
import UserForm from "./User/Form";

function App() {
  return (
    <>
      <HeroUIProvider>
        <UserForm />
      </HeroUIProvider>
    </>
  );
}

export default App;
