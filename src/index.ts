import { initDatabase } from "./database";
import { initApp } from "./app";

// Init DB
initDatabase()
    // Init Express App
    .then(() => initApp())
    .then(() => {
        // API Routes
        require("./api/get-root");
        require("./api/get-properties");
        require("./api/get-properties-ID");
        require("./api/post-upload");
        require("./api/post-properties");
    });
