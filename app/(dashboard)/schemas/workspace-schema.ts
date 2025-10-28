// workspace-schema.ts
import { z } from "zod";

export const workspaceFormSchema = z.object({
   name: z.string().min(2, {
        message: "Workspace name must be at least 2 characters.",
    }),
});

export type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;