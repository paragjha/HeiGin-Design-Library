import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@heigin/ui/styles.css";
import "@heigin/ui/base.css";
import "./docs-theme.css";
import "./docs.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
