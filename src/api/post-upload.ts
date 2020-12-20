import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { bucket } from "../storage";

const fileName = "./downloads/124833195/0.webp";

app.post("/upload", isAuthorized, (req, res) => {
    const d = new Date();
    bucket
        .upload(fileName, {
            gzip: true,
            destination: `test/${d.getTime()}.webp`,
            metadata: {
                cacheControl: "public, max-age=31536000",
            },
        })
        .then(([file, metadata]) => {
            res.status(201).send({
                message: `${fileName} uploaded to bucket: ${bucket.name}`,
                file,
                metadata,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: `${fileName} didn't upload to bucket: ${bucket.name}`,
                err,
            });
        });
});
