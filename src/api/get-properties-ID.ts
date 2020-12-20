import { app } from "../app";
import { isAuthorized } from "../utils/auth";
import { propertiesCollection } from "../database";

app.get("/properties/:id", isAuthorized, (req, res) => {
    propertiesCollection
        .find({ scout_id: req.params["id"] })
        .toArray()
        .then((values) => {
            res.send({
                message: "One property",
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
