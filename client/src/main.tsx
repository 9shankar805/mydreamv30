import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Handle unhandled promise rejections at the global level
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default error display
  event.preventDefault();
});

// Handle uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  // Add a temporary loading indicator
  rootElement.innerHTML = '<div style="padding: 20px; text-align: center;">Loading Siraha Bazaar...</div>';
  
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log("React app mounted successfully");
} catch (error: any) {
  console.error("Failed to mount React app:", error);
  const errorMessage = error?.message || String(error);
  document.body.innerHTML = `<div style="padding: 20px; color: red; text-align: center;">Error mounting React app: ${errorMessage}</div>`;
}
