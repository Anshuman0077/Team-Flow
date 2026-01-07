import { ArcjetNextRequest } from "@arcjet/next";
import { os } from "@orpc/server";


export const base = os.$context<{request: Request | ArcjetNextRequest}>().errors({
    RATE_LIMITED: {
        message: "You are being rate limited."
    },
    BAD_REQUEST: {
        message: "Bad Request"
    },
    NOT_FOUND:{
        message: "Not Found"
    },
    FORBIDDEN:{
        message: "This is Forbidden"
    },
    UNAUTHORIZED: {
        message: "You are Unauthorized"
    },
    INTERNAL_SERVER_ERROR: {
        message: "Internal Server Error"
    }
})