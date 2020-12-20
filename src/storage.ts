import { Storage } from "@google-cloud/storage";
const bucketName = "tk-immoscout-bucket";

const storage = new Storage();
export const bucket = storage.bucket(bucketName);
