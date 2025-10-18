
import { base } from "../middleware/base";
import { KindeOrganization } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";



export const requiredWorkspaceMiddleware = base
  .$context<{
     workspace?: KindeOrganization<unknown | null>;
  }>().middleware( async ({context, next, errors}) => {
    const workspace = context.workspace ?? (await getWorkspace());
    if (!workspace) {
        throw errors.FORBIDDEN() // ✅ Add parentheses
    }
    return next({
        context: { workspace }
    })  
  })


const getWorkspace  = async () => {
    const { getOrganization } = getKindeServerSession()
    const organization = await getOrganization()
    return organization;
} 