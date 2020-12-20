import { Db, Collection, MongoClient } from "mongodb";

let db: Db;
const dbConnection = process.env.DB_CONNECTION;

export let propertiesCollection: Collection;

export function initDatabase() {
    if (!dbConnection) throw Error("DB_CONNECTION not found in process.env !");

    MongoClient.connect(dbConnection, { useUnifiedTopology: true })
        .then((client) => {
            console.log("Connected succesful to MongoDB Server");
            db = client.db("immoscoutdb");
            propertiesCollection = db.collection("properties");
        })
        .catch((err) => console.error(err));
}
