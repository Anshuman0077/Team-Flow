import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {z} from "zod"

import { base } from "../middleware/base";

import { requiredAuthMiddleware } from "../middleware/auth";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { workspaceFormSchema } from "../(dashboard)/schemas/workspace-schema";
import { init, Organizations } from "@kinde/management-api-js";
import { standardSecurityMiddleware } from "../middleware/arcjet/standard";
import { heavyWriteSecurityMiddleware } from "../middleware/arcjet/heavy-write";


export const listworkspaces = base
   .use(requiredAuthMiddleware)
   .use(requiredWorkspaceMiddleware)
   .route({
    method: "GET",
    path: "/workspace",
    summary: "list all workspaces",
    tags: ["workspace"],
   })
    .input(z.void())
    .output(
        z.object({
            workspaces: z.array(
                z.object({
                    id: z.string(),
                    name: z.string(),
                    avatar: z.string()
                })
            ),
            user: z.custom<KindeUser<Record<string, unknown>>>(),
            currentWorkspace: z.custom<KindeOrganization<unknown>>(),
        })
    )
    .handler(async ({context ,errors}) => {

        const { getUserOrganizations } = getKindeServerSession();
        const organizations = await getUserOrganizations();
      
        if (!organizations) {
          throw errors.FORBIDDEN();
        }
      
        return {
          workspaces: organizations.orgs.map((org) => ({
            id: org.code,
            name: org.name ?? "My Workspace",
            avatar: org.name?.charAt(0) ?? "M",
          })),
          user: context.user,
          currentWorkspace: context.workspace,
        };

        
})



export const createWorkspace = base
   .use(requiredAuthMiddleware)
   .use(standardSecurityMiddleware)
   .use(heavyWriteSecurityMiddleware)
   .route({
    method: "POST",
    path: "/workspace",
    summary: "Create a new workspace",
    tags: ["workspace"],
   })
    .input(workspaceFormSchema)
    .output(
        z.object({
            orgCode: z.string(),
            workspaceName: z.string(),
        })
    )
    .handler(async ({context, errors, input}) => {
        console.log("Creating workspace with input:", input);
        
        // Initialize with Management API credentials
        init({
            kindeDomain: process.env.KINDE_DOMAIN!,
            clientId: process.env.KINDE_MANAGEMENT_API_CLIENT_ID!,
            clientSecret: process.env.KINDE_MANAGEMENT_API_CLIENT_SECRET!,
        });

        let data;

        try {
            data = await Organizations.createOrganization({
                requestBody: {
                    name: input.name,
                },
            });
        } catch (error) {
            console.error("Error creating organization:", error);
            throw errors.FORBIDDEN({
                message: "Failed to create organization - check management API permissions"
            });
        }

        if (!data?.organization?.code) {
            console.error("Organization creation response:", data);
            throw errors.FORBIDDEN({
                message: "Org code is not defined in response",
            });
        }

        // Add user to organization
        try {
            await Organizations.addOrganizationUsers({
                orgCode: data.organization.code,
                requestBody: {
                    users: [
                        {
                            id: context.user.id,
                            roles: ["admin"]
                        }
                    ]
                }
            });
        } catch (error) {
            console.error("Error adding user to organization:", error);
            // Continue anyway
        }

        const { refreshTokens } = getKindeServerSession();
        await refreshTokens();

        return {
            orgCode: data.organization.code,
            workspaceName: input.name
        };
    });