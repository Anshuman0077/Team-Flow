
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import arcjet, { detectBot, sensitiveInfo, shield } from "@/lib/arcjet"
import { base } from "../base";



const buildStandartAj = () => 
    arcjet.withRule(
        shield({
            mode:"LIVE"
        })
    ).withRule(
        detectBot({
            mode:"LIVE",
            allow:[
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:PREVIEW",
                "CATEGORY:MONITOR",
            ],
        })
    )
    .withRule(
        sensitiveInfo({
            mode: "LIVE",
            deny: ["PHONE_NUMBER", "CREDIT_CARD_NUMBER"]
        })
    );






export const standardSecurityMiddleware = base
.$context<{
    request: Request;
    user: KindeUser<Record<string , unknown>>
}>()
.middleware(async ({ context , next , errors }) => {

    const decision = await buildStandartAj().protect(context.request , {
        userId: context.user.id
    });

    if (decision.isDenied()) {
        if (decision.reason.isBot()) {
            throw errors.FORBIDDEN({
                message: "Automated traffic blocked"
            });
        }

        if (decision.reason.isShield()) {
            throw errors.FORBIDDEN({
                message: "Request blocked by security policy (WAF)"
            })
        }
        if (decision.reason.isSensitiveInfo()) {
            throw errors.BAD_REQUEST({
                message: "Senstive information detected. Please remove PII ( e.g., credit cards , phone numbers).   "
            });
        }

        errors.FORBIDDEN({
            message: "Request blocked!"
        })
    }

    return next()


   
})

