
import z from "zod";

export const createMessageSchema = z.object({
    channelId: z.string(),
    content: z.string(),
    imageUrl: z.url().optional(),
    threadId: z.string().optional(),
});


export const updateMessageSchema = z.object({
    messageId: z.string(),
    content: z.string(),
})
// Export the inferred TypeScript type
export type CreateMessageSchema = z.infer<typeof createMessageSchema>;

export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;