
import z from "zod";
import { standardSecurityMiddleware } from "../middleware/arcjet/standard";
import { requiredAuthMiddleware } from "../middleware/auth";
import { base } from "../middleware/base";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { prisma } from "@/lib/db";
import { createMessageSchema, updateMessageSchema } from "../(dashboard)/schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@prisma/client";
import { WriteSecurityMiddleware } from "../middleware/arcjet/write";
import { ReadSecurityMiddleware } from "../middleware/arcjet/read";
import { MessageListItem } from "@/lib/types";


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


          if (input.threadId) {
            const parentMessage = await prisma.message.findFirst({
              where: {
                id: input.threadId,
                channel: {
                  workspaceId: context.workspace.orgCode,
                },
              },
            });

            if (!parentMessage || parentMessage.channelId !== input.channelId || parentMessage.threadsId !== null) {
              throw errors.BAD_REQUEST()
            }
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
                threadsId: input.threadId,
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
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().optional(),
    }))
    .output(z.object({
        items: z.array(z.custom<MessageListItem>()),
        nextCursor: z.string().optional(),
    }))
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

        const limit = input.limit ?? 30

        const messages = await prisma.message.findMany({
            where:{
                channelId: input.channelId,
                threadsId: null,
            },
            ...(input.cursor
                ? {
                    cursor: {id: input.cursor},
                    skip:1,
                } : {}),
                take: limit,
                orderBy: [{createdAt: "desc"} , {id: "desc"}],
                include: {
                  _count: {select: {replies: true}}
                }



        });

        const items: MessageListItem[] = messages.map((m) => ({
          id: m.id,
          content: m.content,
          imageUrl: m.imageUrl,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          authorAvatar: m.authorAvatar,
          authorEmail: m.authorEmail,
          authorId: m.authorId,
          authorName: m.authorName,
          channelId: m.channelId,
          threadsId: m.threadsId,
          repliesCount: m._count.replies,
        }))

        const nextCursor = messages.length === limit ? messages[messages.length - 1].id : undefined;

        return {
            items: items,
            nextCursor,
        };
    });



    export const updateMessage = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(WriteSecurityMiddleware)
    .route({
      method: "PUT",
      path: "/messages/:messageId",
      summary: "you can update your messages",
      tags: ["Messages"],
    })
    .input(updateMessageSchema)
    .output(
      z.object({
        message: z.custom<Message>(),
        canEdit: z.boolean(),
      })
    )
    .handler(async ({ context, input, errors }) => {
      const message = await prisma.message.findFirst({
        where: {
          id: input.messageId,
          channel: { // ✅ lowercase
            workspaceId: context.workspace.orgCode,
          },
        },
        select: {
          id: true,
          authorAvatar: true,
          authorId: true, // ✅ required for permission check
        },
      });
  
      if (!message) throw errors.NOT_FOUND();
  
      if (message.authorId !== context.user.id) throw errors.FORBIDDEN();
  
      const updated = await prisma.message.update({
        where: { id: input.messageId },
        data: { content: input.content },
      });
  
      return {
        message: updated, // ✅ correct spelling
        canEdit: updated.authorId === context.user.id,
      };
    });


    export const listThreadReplies = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(ReadSecurityMiddleware)
    .route({
      method: "GET",
      path: "/messages/:messageId/thread",
      summary: "List replies in a thread",
      tags: ["Messages"],
    })
    .input(z.object({ messageId: z.string() }))
    .output(
      z.object({
        parent: z.custom<Message>(),
        messages: z.array(z.custom<Message>()),
      })
    )
    .handler(async ({ input, context, errors }) => {
  
      // ✔️ FIX 1: Fetch correct parent
      const parent = await prisma.message.findFirst({
        where: {
          id: input.messageId,
          channel: { workspaceId: context.workspace.orgCode },
        },
      });
  
      if (!parent) throw errors.NOT_FOUND();
  
      // ✔️ FIX 2: Validate parent is not itself a reply
      if (parent.threadsId !== null) {
        throw errors.BAD_REQUEST();
      }
  
      // ✔️ FIX 3: Fetch replies with workspace validation
      const replies = await prisma.message.findMany({
        where: {
          threadsId: input.messageId,
          channel: { workspaceId: context.workspace.orgCode },
        },
        orderBy: [
          { createdAt: "asc" },
          { id: "asc" },
        ],
      });
  
      return { parent, messages: replies };
    });