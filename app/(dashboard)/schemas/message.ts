import z from "zod";

export const createMessageSchema = z.object({
    channelId: z.string(),
    content: z.string(),
    imageUrl: z.url().optional(),
});

// Export the inferred TypeScript type
export type CreateMessageSchema = z.infer<typeof createMessageSchema>;