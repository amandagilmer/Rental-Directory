console.log("Main entry point loading...");
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Creating React root...");
const rootElement = document.getElementById("root");
if (!rootElement) {
    console.error("Critical Error: Root element not found!");
} else {
    createRoot(rootElement).render(<App />);
    console.log("App render called.");
}
