import React from "react";
import { createRoot } from "react-dom/client";
import App from "./player/App.jsx";
import demoData from "./demo.json";

const root = createRoot(document.getElementById("app"));

if (window.Materia?.Engine) {
    Materia.Engine.start({
        start: (instance, qset) => {
            console.log("Game instance started with qset:", qset);
            root.render(<App qset={qset} />);
        },
    });
} else {
    // dev fallback — use demo.json
    root.render(<App qset={demoData.qset} />);
}
