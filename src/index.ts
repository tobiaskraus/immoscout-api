import { initDatabase } from "./database";
import { initApp } from "./app";

// Init Express App
initApp();

// Init DB
initDatabase();

// API Routes
import "./api/get-root";
import "./api/get-properties";
import "./api/post-upload";
import "./api/post-properties";
