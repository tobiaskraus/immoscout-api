import { File } from "formidable";
import to from "await-to-js";

import { bucket } from "../storage";
import { RejectData } from "../models/reject-data";

/**
 * uploads a file (from Formidable middleware) into Bucket
 *
 * @return Promise: resolve: void / reject: RejectData
 */
export function uploadFile(params: { propertyId: string; file: File; pathInBucket: string }) {
    return new Promise<void>(async (resolve, reject) => {
        const [err, uploadResponse] = await to(
            bucket.upload(params.file.path, {
                gzip: true,
                destination: params.pathInBucket,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            })
        );
        if (err || !uploadResponse) {
            const rejectData: RejectData = {
                status: 500,
                send: {
                    message: `couldn't upload to bucket "${bucket.name}": ${params.pathInBucket}`,
                    err,
                },
            };
            reject(rejectData);
            return;
        }
        resolve();
    });
}
