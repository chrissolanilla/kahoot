import React from "react";
import { createRoot } from "react-dom/client";
import App from "./player/App.jsx";

const app = document.getElementById("app");
createRoot(app).render(
	<App />
);

