console.log("Main entry point loading...");
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        console.error("Failed to find the root element");
    } else {
        console.log("Creating React root...");
        const root = createRoot(rootElement);
        console.log("App render called.");
        root.render(<App />);
    }
} catch (error) {
    console.error("FATAL ERROR DURING RENDER:", error);
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="padding: 20px; color: red;"><h1>React Mount Error</h1><pre>${error instanceof Error ? error.stack : String(error)}</pre></div>`;
    }
}
