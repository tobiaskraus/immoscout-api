import express from "express";
import bodyParser from "body-parser";
import { MongoClient, Db, Collection } from "mongodb";
import dotenv from "dotenv";
import fs from "fs";
import cors from "cors";

import { Property } from "./models/property";
import { isAuthorized } from "./utils/auth";
import { downloadImage } from "./utils/download-image";

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
        db = client.db("immoscoutdb");
        flatCollection = db.collection("properties");
    })
    .catch((err) => console.error(err));

// API Routes

app.get("/", (req, res) => {
    res.send({
        message: "This app is running",
    });
});

app.get("/properties", isAuthorized, (req, res) => {
    flatCollection
        .find()
        .toArray()
        .then((values) => {
            res.send({
                message: "All properties.",
                data: values,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Unhandled error",
                error: err,
            });
        });
});

app.post("/properties", isAuthorized, (req, res) => {
    const body: Property = req.body;

    // validate
    const errors: string[] = [];
    body.scout_id ?? errors.push("no body.scout_id");
    body.title ?? errors.push("no body.title");
    body.scout_id?.match(/\d{9,9}$/) ??
        errors.push("body.scout_id has to consist of only 9 digits");

    if (errors.length) {
        res.status(400).send({ errors });
        return;
    }

    flatCollection
        .insertOne(body)
        .then((result) => {
            if (body.images && body.images.length) {
                // create folder and download files
                const dir = `./downloads/${body.scout_id}`;
                // mkdir with `recursive` needs Node > 10.12.0
                fs.promises.mkdir(dir, { recursive: true }).then(() => {
                    body.images.forEach((imgUrl, i) => {
                        downloadImage(imgUrl, `${dir}/${i}.webp`);
                    });
                });
            }
            return result;
        })
        .then((result) => {
            res.status(201).send({
                message: "Property created",
                result,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Unhandled error",
                error: err,
            });
        });
});

app.listen(port, () => {
    console.log(`This app is running under port ${port}`);
});
app.on("connection", (connection) => {
    connection.on("close", () => close());
});
