
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import arcjet, { detectBot, shield } from "@/lib/arcjet"
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

        errors.FORBIDDEN({
            message: "Request blocked!"
        })
    }

    return next()


   
})

