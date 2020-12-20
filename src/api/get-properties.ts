import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { propertiesCollection } from "../database";

app.get("/properties", isAuthorized, (req, res) => {
    propertiesCollection
        .find()
        .toArray()
        .then((values) => {
            res.send({
                message: "All properties.",
                data: values,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Unhandled error",
                error: err,
            });
        });
});
