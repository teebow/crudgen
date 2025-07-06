
export function heroMainAppContent(componentsImport: string, routes: string) {
  return `import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
import { DataProvider } from "./core/context/DataProvider";
${componentsImport}

const App: React.FC = () => {
  return (
  <DataProvider>
    <Router>
      <div className="flex h-screen bg-background text-foreground">
        <CollapsibleSidebar />
        <main className="flex-1 p-4 overflow-auto">
          <Routes>
            ${routes}
          </Routes>
        </main>
      </div>
    </Router>
  </DataProvider>
  );
};

export default App;`;
}
