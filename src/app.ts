import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

export const app = express();

export function initApp() {
    app.use(bodyParser.json());
    app.use(cors());
    const port = process.env.PORT;

    app.listen(port, () => {
        console.log(`This app is running under port ${port}`);
    });
    app.on("connection", (connection) => {
        connection.on("close", () => close());
    });
}
