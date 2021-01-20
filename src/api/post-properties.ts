import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { Property } from "../models/property";
import { propertiesCollection } from "../database";
import { downloadFileAndUpload } from "../utils/download-file-and-upload";
import { bucket } from "../storage";

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

    // add data to property
    const property: Property = {
        ...body,
        created_at: new Date(),
        images: body.images.map((img, i) => ({
            ...img,
            urlBucket: `https://storage.googleapis.com/${bucket.name}/properties/${body.scout_id}/${i}.webp`,
        })),
    };

    propertiesCollection
        // create Property in DB
        .insertOne(property)
        .then(() => {
            // if it has images: upload them into bucket
            if (body.images && body.images.length) {
                const promises: Promise<void>[] = [];
                body.images.forEach((imgUrl, i) => {
                    const pathInBucket = `properties/${body.scout_id}/${i}.webp`;
                    promises.push(downloadFileAndUpload(imgUrl.url, pathInBucket));
                });
                return Promise.all<void>(promises);
            }
            return Promise.resolve([]);
        })
        .then(() => {
            res.status(201).send({
                message: "Property created",
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Unhandled error",
                error: err,
            });
        });
});
