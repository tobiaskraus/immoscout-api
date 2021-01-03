import formidable from "express-formidable";
import { to } from "await-to-js";

import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { bucket } from "../storage";
import { propertiesCollection } from "../database";
import { Upload } from "../models/upload";

app.post("/upload", formidable(), isAuthorized, async (req, res) => {
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

    const [errUpload, uploadResponse] = await to(
        bucket.upload(filesArray[0].path, {
            gzip: true,
            destination: pathInBucket,
            metadata: {
                cacheControl: "public, max-age=31536000",
            },
        })
    );
    if (errUpload || !uploadResponse) {
        res.status(500).send({
            message: `couldn't upload to bucket "${bucket.name}": ${pathInBucket}`,
            errUpload,
        });
        return;
    }

    const file = uploadResponse[0];
    const upload: Upload = {
        name: filesArray[0].name,
        url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
    };

    const [errUpdateDb, updateDbResponse] = await to(
        propertiesCollection.updateMany({ scout_id: propertyId }, { $push: { uploads: upload } })
    );
    if (errUpdateDb || !updateDbResponse) {
        res.status(500).send({
            message: `couldn't update DB. But file was saved to bucket`,
            errUpdateDb,
        });
        return;
    }

    res.status(201).send({
        message: `uploaded to bucket '${bucket.name}': '${pathInBucket}' and modified in Database ${updateDbResponse.modifiedCount} Document(s).`,
    });
});

async function uploadFileAndUpdateDb(propertyId: string, file: File) {
    return new Promise((resolve, reject) => {});
}
