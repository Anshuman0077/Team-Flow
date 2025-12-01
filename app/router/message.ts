
import z from "zod";
import { standardSecurityMiddleware } from "../middleware/arcjet/standard";
import { requiredAuthMiddleware } from "../middleware/auth";
import { base } from "../middleware/base";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { prisma } from "@/lib/db";
import { createMessageSchema, GroupReactionsSchema, GroupReactionsSchemaType,  toggleReactionSchema, updateMessageSchema } from "../(dashboard)/schemas/message";
import { getAvatar } from "@/lib/get-avatar";
import { Message } from "@prisma/client";
import { WriteSecurityMiddleware } from "../middleware/arcjet/write";
import { ReadSecurityMiddleware } from "../middleware/arcjet/read";
import { MessageListItem } from "@/lib/types";



function groupReactions(
  reactions: { emoji: string; userId: string }[],
  userId: string
): GroupReactionsSchemaType[] {
  const reactionMap = new Map<string, { count: number; reactedByMe: boolean }>();

  for (const reaction of reactions) {
    const existing = reactionMap.get(reaction.emoji);

    if (existing) {
      existing.count++;
      if (reaction.userId === userId) {
        existing.reactedByMe = true;
      }
    } else {
      reactionMap.set(reaction.emoji, {
        count: 1,
        reactedByMe: reaction.userId === userId,
      });
    }
  }

  return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    reactedByMe: data.reactedByMe,
  }));
}


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
                  _count: {select: {replies: true}},
                  MessageReaction: {
                    select: {
                      emoji: true,
                      userId: true,
                    }
                  }
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
          reactions: groupReactions(
            m.MessageReaction.map((r) => ({
              emoji: r.emoji,
              userId: r.userId,
            })),
            context.user.id
          ),
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
        parentRow: z.custom<MessageListItem>(),
        messages: z.array(z.custom<MessageListItem>()),
      })
    )
    .handler(async ({ input, context, errors }) => {
  
      // ✔️ FIX 1: Fetch correct parent
      const parent = await prisma.message.findFirst({
        where: {
          id: input.messageId,
          channel: {
             workspaceId: context.workspace.orgCode 
          },
        },
        include: {
          _count: {
            select: {
              replies: true,
            },
          },
          MessageReaction: {
            select: {
              emoji: true,
              userId: true,
            }
          }
        }
      });
  
      if (!parent) throw errors.NOT_FOUND();
  
      // ✔️ FIX 2: Validate parent is not itself a reply
      if (parent.threadsId !== null) {
        throw errors.BAD_REQUEST();
      }
  
      // ✔️ FIX 3: Fetch messages with replies
      const messagesQuery = await prisma.message.findMany({
        where: {
          threadsId: input.messageId,
          // channel: { workspaceId: context.workspace.orgCode },
        },
        orderBy: [
          { createdAt: "asc" },
          { id: "asc" },
        ],
        include: {
          _count: {
            select : {
              replies: true,
            },
          },
          MessageReaction: {
            select: {
               emoji: true,
               userId: true,
            },
          },
        },
      });

      const parentRow: MessageListItem = {
        id: parent.id,
        content: parent.content,
        imageUrl: parent.imageUrl,
        authorAvatar: parent.authorAvatar,
        authorEmail: parent.authorEmail,
        authorId:parent.authorId,
        authorName: parent.authorName,
        channelId: parent.channelId,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
        threadsId: parent.threadsId,
        repliesCount: parent._count.replies,
        reactions: groupReactions(
          parent.MessageReaction.map((r) => ({
            emoji: r.emoji,
            userId: r.userId,
          })),
          context.user.id
        )

      }

      const messages: MessageListItem[] = messagesQuery.map((m) => ({
        id: m.id,
        content: m.content,
        imageUrl: m.imageUrl,
        authorAvatar: m.authorAvatar,
        authorEmail: m.authorEmail,
        authorId:m.authorId,
        authorName: m.authorName,
        channelId: m.channelId,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        threadsId: m.threadsId,
        repliesCount: parent._count.replies,
        reactions: groupReactions(
          parent.MessageReaction.map((r) => ({
            emoji: r.emoji,
            userId: r.userId,
          })),
          context.user.id
        )
        }))


      return { parentRow, messages };
    });




    export const toggleReaction = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(standardSecurityMiddleware)
    .use(WriteSecurityMiddleware)
    .route({
      method: "POST",
      path: "/messages/:messageId/reactions",
      tags: ["Messages"],
      summary: "Toggle a reaction",
    })
    .input(toggleReactionSchema)
    .output(
      z.object({
        messageId: z.string(),
        reactions: z.array(GroupReactionsSchema),
      })
    )
    .handler(async ({ errors, input, context }) => {
      // ensure the message exists and belongs to workspace
      const message = await prisma.message.findFirst({
        where: {
          id: input.messageId,
          channel: {
            workspaceId: context.workspace.orgCode,
          },
        },
        select: {
          id: true,
        },
      });
  
      if (!message) {
        throw errors.NOT_FOUND();
      }
  
      // try insert — skip duplicates so repeated toggles don't fail
      const inserted = await prisma.messageReaction.createMany({
        data: [
          {
            emoji: input.emoji,
            messageId: input.messageId,
            userId: context.user.id,
            userName: context.user.given_name ?? "john doe",
            userAvatar: getAvatar(context.user.picture, context.user.email!),
            userEmail: context.user.email!,
          },
        ],
        skipDuplicates: true,
      });
  
      // If nothing was inserted, remove the reaction (toggle off)
      if (inserted.count === 0) {
        await prisma.messageReaction.deleteMany({
          where: {
            messageId: input.messageId,
            userId: context.user.id,
            emoji: input.emoji,
          },
        });
      }
  
      // Get the up-to-date reactions for the message
      const updated = await prisma.message.findUnique({
        where: {
          id: input.messageId,
        },
        include: {
          MessageReaction: {
            select: {
              emoji: true,
              userId: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });
  
      // IMPORTANT: make sure updated exists — we already checked message earlier,
      // but findUnique might return null in some edge case. Throw to guarantee return types.
      if (!updated) {
        throw errors.NOT_FOUND();
      }
  
      // return with guaranteed messageId (string) and grouped reactions
      return {
        messageId: updated.id,
        reactions: groupReactions(
          (updated.MessageReaction ?? []).map((r) => ({
            emoji: r.emoji,
            userId: r.userId,
          })),
          context.user.id
        ),
      };
    });