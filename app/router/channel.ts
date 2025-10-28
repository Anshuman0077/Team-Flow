import z from "zod";
import { ChannelNameSchema } from "../(dashboard)/schemas/channels";
import { heavyWriteSecurityMiddleware } from "../middleware/arcjet/heavy-write";
import { standardSecurityMiddleware } from "../middleware/arcjet/standard";
import { requiredAuthMiddleware } from "../middleware/auth";
import { base } from "../middleware/base";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { prisma } from "@/lib/db";
import { Channel } from "@prisma/client";
import { init, organization_user, Organizations } from "@kinde/management-api-js";
import { KindeOrganization } from "@kinde-oss/kinde-auth-nextjs";

// Initialize Kinde Management API once
const initializeKindeManagement = () => {
  if (!process.env.KINDE_DOMAIN || !process.env.KINDE_MANAGEMENT_CLIENT_ID || !process.env.KINDE_MANAGEMENT_CLIENT_SECRET) {
    throw new Error("Missing required Kinde Management API environment variables");
  }
  
  init({
    kindeDomain: process.env.KINDE_DOMAIN,
    clientId: process.env.KINDE_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.KINDE_MANAGEMENT_CLIENT_SECRET,
  });
};

// Creating new channels
export const createChannel = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standardSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/channel",
    summary: "Create a new Channel",
    tags: ["channels"],
  })
  .input(ChannelNameSchema)
  .output(z.custom<Channel>())
  .handler(async ({ input, errors, context }) => {
    const channel = await prisma.channel.create({
      data: {
        name: input.name,
        workspaceId: context.workspace.orgCode,
        createdById: context.user.id
      },
    });
    return channel;
  });

// Channels listing 
export const listChannel = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/channel",
    summary: "You can list all Channel",
    tags: ["channels"],
  })
  .input(z.void())
  .output(
    z.object({
      channels: z.array(z.custom<Channel>()),
      currentWorkspace: z.custom<KindeOrganization<unknown>>(),
      members: z.array(z.custom<organization_user>())
    })
  )
  .handler(async ({ context, errors }) => {
    try {
      // Initialize Kinde Management API
      initializeKindeManagement();

      const [channels, members] = await Promise.all([
        prisma.channel.findMany({
          where: {
            workspaceId: context.workspace.orgCode,
          },
          orderBy: {
            createdAt: "desc"
          },
        }),
        (async () => {
          try {
            const usersIdOrg = await Organizations.getOrganizationUsers({
              orgCode: context.workspace.orgCode,
              sort: "name_asc"
            });
            return usersIdOrg.organization_users ?? [];
          } catch (error) {
            console.error("Error fetching organization users:", error);
            return [];
          }
        })(),
      ]);

      return {
        channels,
        members,
        currentWorkspace: context.workspace,
      };
    } catch (error) {
      console.error("Error in listChannel handler:", error);
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to fetch channels and members"
      });
    }
  });