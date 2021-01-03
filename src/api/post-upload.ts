import formidable from "express-formidable";
import { File } from "formidable";
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
    if (!propertyId || typeof propertyId !== "string") {
        res.status(400).send({
            message: "no propertyId found in request (form-data)",
        });
        return;
    }

    const [err, response] = await to(uploadFileAndUpdateDb(propertyId, filesArray[0]));
    if (err) res.status(500).send(err);
    else res.status(200).send(response);
});

async function uploadFileAndUpdateDb(propertyId: string, file: File) {
    return new Promise(async (resolve, reject) => {
        const pathInBucket = `properties/${propertyId}/uploads/${file.name}`;

        // Step 1: Upload to Bucket
        const [errUpload, uploadResponse] = await to(
            bucket.upload(file.path, {
                gzip: true,
                destination: pathInBucket,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            })
        );
        if (errUpload || !uploadResponse) {
            reject({
                message: `couldn't upload to bucket "${bucket.name}": ${pathInBucket}`,
                errUpload,
            });
            return;
        }

        // Step 2: Update DB
        const uploadedFile = uploadResponse[0];
        const upload: Upload = {
            name: uploadedFile.name,
            url: `https://storage.googleapis.com/${bucket.name}/${uploadedFile.name}`,
        };

        const [errUpdateDb, updateDbResponse] = await to(
            propertiesCollection.updateMany(
                { scout_id: propertyId },
                { $push: { uploads: upload } }
            )
        );
        if (errUpdateDb || !updateDbResponse) {
            reject({
                message: `couldn't update DB. But file was saved to bucket`,
                errUpdateDb,
            });
            return;
        }

        resolve({
            message: `uploaded to bucket '${bucket.name}': '${pathInBucket}' and modified in Database ${updateDbResponse.modifiedCount} Document(s).`,
        });
    });
}
