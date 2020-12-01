import { RequestHandler } from "express";

const authToken = `Bearer ${process.env.AUTH_TOKEN}`;

export const isAuthorized: RequestHandler = (req, res, next) => {
    if (req.headers.authorization !== authToken && req.headers["Authorization"] !== authToken) {
        return res.status(401).send({
            message: "Not authorized.",
        });
    }
    return next();
};
