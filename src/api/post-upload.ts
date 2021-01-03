import formidable from "express-formidable";
import { File } from "formidable";
import { to } from "await-to-js";

import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { bucket } from "../storage";
import { propertiesCollection } from "../database";
import { Upload } from "../models/upload";
import { Property } from "../models/property";
import { addSuffixToFileNameIfExists } from "../utils/add-suffix-to-filename-if-exists";

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
        // Step 1: make sure property exists and avoid overriding file (if same filename)
        const [errProperty, resProperty] = await to<Pick<Property, "scout_id" | "uploads">[]>(
            propertiesCollection
                .find(
                    { scout_id: propertyId },
                    {
                        projection: { scout_id: true, uploads: true },
                    }
                )
                .toArray()
        );
        if (errProperty || !resProperty || !resProperty[0]) {
            reject({
                message: `couldn't find the property in DB`,
                errProperty,
            });
            return;
        }
        const maxSuffix = 1000;
        const filename = resProperty[0].uploads
            ? addSuffixToFileNameIfExists(
                  file.name,
                  resProperty[0].uploads.map((upload) => upload.name),
                  maxSuffix
              )
            : file.name;

        if (!filename) {
            reject({
                message: `couldn't save the file, because this filename already exists in property more than ${maxSuffix} times`,
                errProperty,
            });
            return;
        }

        // Step 2: Upload to Bucket
        const pathInBucket = `properties/${propertyId}/uploads/${filename}`;
        const [errUpload, resUpload] = await to(
            bucket.upload(file.path, {
                gzip: true,
                destination: pathInBucket,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            })
        );
        if (errUpload || !resUpload) {
            reject({
                message: `couldn't upload to bucket "${bucket.name}": ${pathInBucket}`,
                errUpload,
            });
            return;
        }

        // Step 3: Update DB
        const uploadedFile = resUpload[0];
        const upload: Upload = {
            name: filename,
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
