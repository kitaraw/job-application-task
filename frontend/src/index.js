import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HelmetProvider } from "react-helmet-async";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/JWTContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode> 
  // React.StrictMode закомментирован, чтобы предотвратить двойной рендеринг компонентов 
  // в режиме разработки, который может вызывать ложное поведение (например, дублирующиеся запросы к апи).
  <AuthProvider>
  <HelmetProvider>
    <SettingsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SettingsProvider>
  </HelmetProvider>
</AuthProvider>
// </React.StrictMode>
);


reportWebVitals();
