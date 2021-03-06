import formidable from "express-formidable";
import { to } from "await-to-js";

import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { RejectData } from "../models/reject-data";
import { bucket } from "../storage";
import { propertiesCollection } from "../database";
import { Upload } from "../models/upload";
import { Property } from "../models/property";
import { addSuffixToFileNameIfExists } from "../utils/add-suffix-to-filename-if-exists";
import { uploadFile } from "../utils/upload-file";

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

    let filename: string;
    let pathInBucket: string;

    checkIfPropertyExists(propertyId)
        .then((propertyUploadsPartial) => {
            return changeFilenameIfExists(
                filesArray[0].name,
                propertyUploadsPartial.uploads.map((u) => u.name)
            );
        })
        .then((_filename) => {
            filename = _filename;
            pathInBucket = `properties/${propertyId}/uploads/${filename}`;

            return uploadFile({
                propertyId,
                file: filesArray[0],
                pathInBucket,
            });
        })
        .then(() => {
            return updatePropertyInDb(filename, propertyId, pathInBucket);
        })
        .then((response) => {
            res.status(200).send(response);
        })
        .catch((rejectData: RejectData) => {
            res.status(rejectData.status || 500).send(
                rejectData.send || { message: `unexpected error`, rejectData }
            );
        });
});

type PropertyUploadsPartial = Pick<Property, "scout_id" | "uploads">;

function checkIfPropertyExists(propertyId: string) {
    return new Promise<PropertyUploadsPartial>(async (resolve, reject) => {
        const [err, data] = await to(
            propertiesCollection
                .find<PropertyUploadsPartial>(
                    { scout_id: propertyId },
                    {
                        projection: { scout_id: true, uploads: true },
                    }
                )
                .toArray()
        );
        if (err || !data || !data[0]) {
            const rejectData: RejectData = {
                status: 400,
                send: {
                    message: `couldn't find the property in DB`,
                    err,
                },
            };
            reject(rejectData);
            return;
        }
        resolve(data[0]);
    });
}

function changeFilenameIfExists(filename: string, existingFilenames: string[]) {
    const maxSuffix = 1000;
    const uniqueFilename = existingFilenames
        ? addSuffixToFileNameIfExists(filename, existingFilenames, maxSuffix)
        : filename;

    if (!uniqueFilename) {
        const rejectData: RejectData = {
            status: 400,
            send: {
                message: `couldn't save the file, because this filename already exists in property more than ${maxSuffix} times`,
            },
        };
        throw rejectData;
    }
    return uniqueFilename;
}

function updatePropertyInDb(filename: string, propertyId: string, pathInBucket: string) {
    return new Promise(async (resolve, reject) => {
        const upload: Upload = {
            name: filename,
            url: `https://storage.googleapis.com/${bucket.name}/${pathInBucket}`,
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
            message: `uploaded to bucket '${bucket.name}': (filename: '${filename}', url: '${upload.url}') and modified in Database ${updateDbResponse.modifiedCount} Document(s).`,
        });
    });
}
