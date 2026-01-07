
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import arcjet, { sensitiveInfo, slidingWindow } from "@/lib/arcjet"
import { base } from "../base";
import { ArcjetNextRequest } from '@arcjet/next';



const buildStandartAj = () => 
  arcjet.withRule(
    slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 180,
    })
  )
  .withRule(
    sensitiveInfo({
        mode: "LIVE",
        deny: ["PHONE_NUMBER", "CREDIT_CARD_NUMBER"]
    })
);



export const ReadSecurityMiddleware = base
.$context<{
    request: Request | ArcjetNextRequest;
    user: KindeUser<Record<string , unknown>>
}>()
.middleware(async ({ context , next , errors }) => {

    const decision = await buildStandartAj().protect(context.request , {
        userId: context.user.id
    });

    if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
            throw errors.RATE_LIMITED({
                message: "Too many changes impact please slow down."
            });
        }
        if (decision.reason.isSensitiveInfo()) {
            throw errors.BAD_REQUEST({
                message: "Senstive information detected. Please remove PII ( e.g., credit cards , phone numbers).   "
            });
        }

        errors.RATE_LIMITED({
            message: "Request blocked!"
        })
    }
    return next()   
})

