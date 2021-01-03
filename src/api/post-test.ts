import fetch from "node-fetch";

import { bucket } from "../storage";
import { app } from "../app";

app.post("/test", async (req, res) => {
    const url = req.body.url;

    downloadFileAndUploadToBucket(url)
        .then((success) => res.status(200).send(success))
        .catch((err) => res.status(500).send(err));
});

function downloadFileAndUploadToBucket(url: string) {
    const file = bucket.file("my-file");

    return new Promise((resolve, reject) => {
        fetch(url).then((fetchRes) => {
            const writeStream = file.createWriteStream();
            writeStream.on("error", (err) => {
                reject({
                    message: `error in writeStream`,
                    err,
                });
            });
            writeStream.on("finish", () => {
                resolve({
                    message: `writeStream finished`,
                });
                console.log("writeStream finished");
            });
            fetchRes.body.pipe(writeStream);
        });
    });
}
