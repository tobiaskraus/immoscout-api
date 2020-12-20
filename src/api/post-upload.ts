import formidable from "express-formidable";

import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { bucket } from "../storage";

app.post("/upload", formidable(), isAuthorized, (req, res) => {
    const files = req.files;
    const propertyId = req.fields?.propertyId;
    const filesArray = files ? Object.values(files) : [];
    if (!filesArray.length) {
        res.status(400).send({
            message: "no files found in request (form-data)",
        });
        return;
    }
    if (!propertyId) {
        res.status(400).send({
            message: "no propertyId found in request (form-data)",
        });
        return;
    }
    const pathInBucket = `properties/${propertyId}/uploads/${filesArray[0].name}`;
    bucket
        .upload(filesArray[0].path, {
            gzip: true,
            destination: pathInBucket,
            metadata: {
                cacheControl: "public, max-age=31536000",
            },
        })
        .then(([file, metadata]) => {
            res.status(201).send({
                message: `uploaded to bucket "${bucket.name}": ${pathInBucket}`,
                file,
                metadata,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: `couldn't upload to bucket "${bucket.name}": ${pathInBucket}`,
                err,
            });
        });
});
