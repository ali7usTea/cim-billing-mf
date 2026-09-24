import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import "./styles/globals.css";
import ActionReportLayout from "./app/main/debugReport/layout.tsx";
import ActionReportPage from "./app/main/debugReport/page.tsx";
import { Toaster } from "sonner";
import ClientProviders from "./providers/ClientProviders.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClientProviders>
        <Toaster position="top-right" richColors duration={3000} />
        <Routes>
          <Route path="/billing" element={<App />} />
          <Route
            path="/billing/debugReport"
            element={
              <ActionReportLayout>
                <ActionReportPage />
              </ActionReportLayout>
            }
          />
        </Routes>
      </ClientProviders>
    </BrowserRouter>
  </StrictMode>
);
