import { app } from "../app";

/** Health check */
app.get("/", (req, res) => {
    res.send({
        message: "This app is running",
    });
});
