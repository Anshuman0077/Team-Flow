import z from "zod";
import { standardSecurityMiddleware } from "../middleware/arcjet/standard";
import { requiredAuthMiddleware } from "../middleware/auth";
import { base } from "../middleware/base";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { prisma } from "@/lib/db";
import { createMessageSchema } from "../(dashboard)/schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@prisma/client";
import { WriteSecurityMiddleware } from "../middleware/arcjet/write";
import { ReadSecurityMiddleware } from "../middleware/arcjet/read";


export const createMessage = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(WriteSecurityMiddleware)
    .route({
        method: "POST",
        path: "/messages",
        summary: "Create a message",
        tags: ["Messages"]
    })
    .input(createMessageSchema)
    .output(z.custom<Message>())
    .handler( async ({context , errors , input}) => {
        console.log("Message create input:", input);
        console.log("Context workspace:", context.workspace);
        console.log("Context user:", context.user);

        const channel = await prisma.channel.findFirst({
            where: {
                id: input.channelId,
                workspaceId: context.workspace.orgCode,
            },
        });

        if (!channel) {
            console.error("Channel not found for:", input.channelId, context.workspace.orgCode);
            throw errors.FORBIDDEN();
          }

        const created = await prisma.message.create({
            data:{
                content: input.content,
                imageUrl: input.imageUrl,
                channelId: input.channelId,
                authorId: context.user.id,
                authorEmail: context.user.email!,
                authorName: context.user.given_name ?? "John Doe",
                authorAvatar: getAvatar(context.user.picture , context.user.email!),
            }
        })

        return {
            ...created,
        }
    } )

export const listMessages = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(ReadSecurityMiddleware)
    .route({
        method: "GET",
        path: "/messages",
        summary:"list all the messages",
        tags: ["Messages"],
    })
    .input(z.object({
        channelId: z.string(),
    }))
    .output(z.array(z.custom<Message>()))
    .handler(async ({context ,  input , errors}) => {
        const channels = await prisma.channel.findFirst({
            where :{
                id: input.channelId,
                workspaceId: context.workspace.orgCode,
            },
        })

        if (!channels) {
            throw errors.FORBIDDEN();
            
        }

        const data = await prisma.message.findMany({
            where:{
                channelId: input.channelId,
            },
            orderBy: {
                createdAt: "desc"
            },
        });

        return data;

    })


    