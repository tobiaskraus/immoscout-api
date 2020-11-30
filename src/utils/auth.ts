import { RequestHandler } from "express";

const authToken = "Bearer hjdfgzzdgzgzdfgffff__dd";

export const isAuthorized: RequestHandler = (req, res, next) => {
    if (req.headers.authorization !== authToken && req.headers["Authorization"] !== authToken) {
        return res.status(401).send({
            message: "Not authorized. 2",
        });
    }
    return next();
};
