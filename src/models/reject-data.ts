/**
 * Interface for Rejected Data inside Promises.
 * Used by RequestHandlers to send back to Client via Response.status(...)send(...).
 */
export interface RejectData {
    status: number;
    send: {
        message: string;
        err?: any;
    };
}
