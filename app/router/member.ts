import z from "zod";
import { heavyWriteSecurityMiddleware } from "../middleware/arcjet/heavy-write";
import { standardSecurityMiddleware } from "../middleware/arcjet/standard";
import { requiredAuthMiddleware } from "../middleware/auth";
import { base } from "../middleware/base";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { inviteMemberSchema } from "../(dashboard)/schemas/member";
import { init, organization_user, Organizations, Users } from "@kinde/management-api-js";
import { getAvatar } from "@/lib/get-avatar";
import { ReadSecurityMiddleware } from "../middleware/arcjet/read";



export const InviteMember = base
   .use(requiredAuthMiddleware)
   .use(requiredWorkspaceMiddleware)
   .use(standardSecurityMiddleware)
   .use(heavyWriteSecurityMiddleware)
   .route({
    method: "POST",
    path: "/workspace/members/invite",
    tags: ["Members"]
   })
    .input(inviteMemberSchema)
    .output(z.void())
    .handler(async ({errors, input , context}) => {
      try {
         init();
         await Users.createUser({
            requestBody: {
               organization_code: context.workspace.orgCode,
               profile: {
                  given_name: input.name,
                  picture: getAvatar(null , input.email),
               },
               identities: [
                     {
                        type: "email",
                        details: {
                           email: input.email,
                        },
                     },
               ],
            },
         })
         
      } catch {
         throw errors.INTERNAL_SERVER_ERROR()  
      }
    })



export const listMembers = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(ReadSecurityMiddleware)
    .route({
      method:"GET",
      path: "/workspace/members",
      summary: "You can list all members",
      tags: ["Members"]
   })
   .input(z.void())
   .output(z.array(z.custom<organization_user>()))
   .handler(async ({context , errors}) => {
      try {
         init();
         const data =  await Organizations.getOrganizationUsers({
            orgCode: context.workspace.orgCode,
            sort: "name_asc",
         });
         if (!data.organization_users) {
            throw errors.NOT_FOUND();
         }
         return data.organization_users
      } catch {
         throw errors.INTERNAL_SERVER_ERROR()
      }
   })



   