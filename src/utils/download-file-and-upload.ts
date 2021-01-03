import fetch from "node-fetch";

import { bucket } from "../storage";

/**
 * fetches a file from url and directly uploads it to the bucket via stream
 *
 * @param url url of the file
 * @param pathInBucket path of the new file which should be uploaded (with extension)
 */
export function downloadFileAndUpload(url: string, pathInBucket: string) {
    const file = bucket.file(pathInBucket);

    return new Promise<void>((resolve, reject) => {
        fetch(url).then((fetchRes) => {
            const writeStream = file.createWriteStream({
                gzip: true,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            });
            writeStream.on("error", (err) => {
                reject({
                    message: `error in writeStream`,
                    err,
                });
            });
            writeStream.on("finish", () => {
                resolve();
            });
            fetchRes.body.pipe(writeStream);
        });
    });
}
