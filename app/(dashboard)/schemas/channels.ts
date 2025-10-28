import { z } from "zod";

export function transformChannelName(name: string): string {
  let cleanedName = name.trim().toLowerCase();
  cleanedName = cleanedName.replace(/^[-_]+/, "");
  cleanedName = cleanedName.replace(/[-_]+$/, "");
  cleanedName = cleanedName.replace(/[-_]{2,}/g, "-");
  cleanedName = cleanedName.replace(/\s+/g, "-");
  
  // Remove the validation from the transform function
  // Let Zod handle the validation
  return cleanedName;
}

export const ChannelNameSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(50, "Channel name must be at most 50 characters")
    .refine(
      (name) => {
        const cleaned = transformChannelName(name);
        const regex = /^(?=.{2,50}$)[a-zA-Z](?!.*[-_]{2})[a-zA-Z0-9_-]*[a-zA-Z0-9]$/;
        return regex.test(cleaned);
      },
      {
        message: "Channel name must start with a letter, contain only letters, numbers, underscores, or hyphens, not end with a special character, and be 2–50 characters long."
      }
    )
    .transform((name) => transformChannelName(name)),
});

export type ChannelFormValues = z.infer<typeof ChannelNameSchema>;