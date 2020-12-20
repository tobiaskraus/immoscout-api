import formidable from "express-formidable";

import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { bucket } from "../storage";
import { propertiesCollection } from "../database";
import { Upload } from "../models/upload";

app.post("/upload", formidable(), isAuthorized, (req, res) => {
    const files = req.files;
    const propertyId = req.fields?.propertyId;
    const filesArray = files ? Object.values(files) : [];
    if (filesArray.length !== 1) {
        res.status(400).send({
            message:
                "no files found in request (form-data) or too many (only one possible to upload)",
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
        .then(([file]) => {
            const upload: Upload = {
                name: filesArray[0].name,
                url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
            };
            return propertiesCollection.updateMany(
                { scout_id: propertyId },
                { $push: { uploads: upload } }
            );
        })
        .then((updateResult) => {
            res.status(201).send({
                message: `uploaded to bucket '${bucket.name}': '${pathInBucket}' and modified in Database ${updateResult.modifiedCount} Document(s).`,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: `couldn't upload to bucket "${bucket.name}": ${pathInBucket}`,
                err,
            });
        });
});
