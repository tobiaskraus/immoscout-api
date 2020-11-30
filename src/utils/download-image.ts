import fetch from "node-fetch";
import fs from "fs";

/** download image (and override if path exists) */
export function downloadImage(url: string, path: string) {
    return fetch(url).then((fetchRes) => {
        const dest = fs.createWriteStream(path);
        fetchRes.body.pipe(dest);
    });
}
