import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminView from "./views/AdminView";
import WorkoutView from "./views/WorkoutView";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
          <Routes>
            <Route path="/" element={<AdminView />} />
            <Route path="/workout" element={<WorkoutView />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
