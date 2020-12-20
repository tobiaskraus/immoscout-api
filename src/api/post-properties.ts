import fs from "fs";

import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { Property } from "../models/property";
import { propertiesCollection } from "../database";
import { downloadImage } from "../utils/download-image";

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

    propertiesCollection
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
