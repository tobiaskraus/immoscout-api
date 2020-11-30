import express from "express";
import bodyParser from "body-parser";
import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import cors from "cors";

dotenv.config();

const dbConnection = process.env.DB_CONNECTION;

const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT;

let db: Db;
let flatCollection: Collection;

if (!dbConnection) throw Error("DB_CONNECTION not found in process.env !");

// Init MongoDB

MongoClient.connect(dbConnection, { useUnifiedTopology: true })
    .then((client) => {
        console.log("Connected succesful to MongoDB Server");
        db = client.db("real-estate");
        flatCollection = db.collection("flat");
    })
    .catch((err) => console.error(err));

// API Routes

app.get("/", (req, res) => {
    res.send({
        message: "This app is running",
    });
});

app.listen(port, () => {
    console.log(`This app is running under port ${port}`);
});
app.on("connection", (connection) => {
    connection.on("close", () => close());
});
