import z from "zod";
import { requiredAuthMiddleware } from "../middleware/auth";
import { base } from "../middleware/base";
import { requiredWorkspaceMiddleware } from "../middleware/workspace";
import { prisma } from "@/lib/db";
import { tipTapJsonToMarkdown } from "@/lib/json-to-markdown";
import { streamText } from "ai"


import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamToEventIterator } from "@orpc/server";
import { aiSecurityMiddleware } from "../middleware/arcjet/ai";

const openrouter = createOpenRouter({
    apiKey: process.env.LLM_KEY,
});


const MODEL_ID = "tngtech/deepseek-r1t2-chimera:free"

const model = openrouter.chat(MODEL_ID)


export const generateThreadSummary = base
    .use(requiredAuthMiddleware)
    .use(requiredWorkspaceMiddleware)
    .use(aiSecurityMiddleware)
    .route({
        method: "GET",
        path: "/ai/thread/summary",
        summary: "Generate thread Summary",
        tags: ["Ai"],
    })
    .input(z.object({
        MessageId: z.string(),
    }))
    .handler(async ({ context, input, errors }) => {

        const baseMessage = await prisma.message.findFirst({
            where: {
                id: input.MessageId,
                channel: {
                    workspaceId: context.workspace.orgCode,
                },
            },
            select: {
                id: true,
                threadsId: true,
                channelId: true,
            },
        })

        if (!baseMessage) {
            throw errors.NOT_FOUND()
        }

        const parentId = baseMessage.threadsId ?? baseMessage.id

        const parent = await prisma.message.findFirst({
            where: {
                id: parentId,
                channel: {
                    workspaceId: context.workspace.orgCode,
                },
            },

            select: {
                id: true,
                content: true,
                createdAt: true,
                authorName: true,
                replies: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        authorName: true,
                    }
                }
            }
        })

        if (!parent) {
            throw errors.NOT_FOUND();
        }

        const replies = parent.replies.slice().reverse();

        const parentText = await tipTapJsonToMarkdown(parent.content);

        const lines = [];

        lines.push(`Thread Root - ${parent.authorName} - ${parent.createdAt.toISOString()}`)

        lines.push(parentText)

        if (replies.length > 0) {
            lines.push("\nReplies")
            for (const r of replies) {
                const t = await tipTapJsonToMarkdown(r.content)

                lines.push(`- ${r.authorName} - ${r.createdAt.toISOString()}: ${t}`)

            }
        }

        const complied = lines.join("\n");

        const system = [
            "You are an expert assistant summarizing Slack-like discussion treads for a product team.",
            "Use only the provided thread content; do not invert facts, names. or timelines",
            "Output format (Markdown):",
            "- First, write a single concise paragraph(2-4 sentences) that captures the thred's purpose, key decisions, context, and any blockers or next steps. No heading, no list, no intro text.",
            "- Then add a blank line followed by exactly 2-3 bullet points (using) '-' with the most takeaways. Each bullet is one sentece.",
            "- Style: nutural, specific and concise. Preserve terminology from the thread (names , acronyms). Avoid filled or meta-commentary. Do not add a closing sentence",
            "If the context is insufficent, return a single-sentence summary and omit the bullet list.",
        ].join("/n");

        const result = streamText({
            model,
            system,
            messages: [{ role: "user", content: complied }],
            temperature: 0.2
        });

        return streamToEventIterator(result.toUIMessageStream())

    })   


export const generateCompose  = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(aiSecurityMiddleware)
  .route({
    method: "POST",
    path: "/ai/compose/generate",
    summary: "Compose message",
    tags: ["Composer"]
  }).input(z.object({
     content: z.string(),
  }))
  .handler( async ({input}) => {
     const markdown = await tipTapJsonToMarkdown(input.content)


     const system = [
        "ROLE:",
        "You are a professional content rewriting engine, not a conversational assistant.",
      
        "OBJECTIVE:",
        "Rewrite the given content to improve clarity, logical flow, and structure while preserving the original meaning, facts, intent, terminology, names, and tone.",
      
        "CONSTRAINTS:",
        "- Do NOT add new information or remove existing information.",
        "- Do NOT change technical terms, product names, variables, or proper nouns.",
        "- Do NOT add opinions, explanations, commentary, or meta text.",
        "- Do NOT address the reader or writer in any way.",
        "- Do NOT ask questions or include greetings or closings.",
        "- Keep all existing URLs, mentions, and references exactly as they appear.",
        "- Preserve code blocks, inline code, and formatting exactly (no edits inside them).",
      
        "OUTPUT FORMAT:",
        "- Output strictly in valid Markdown.",
        "- Use paragraphs and bullet lists only when they improve readability.",
        "- Do NOT include headings unless they already exist in the input.",
        "- Do NOT output HTML, images, emojis, or decorative symbols.",
      
        "FINAL RULE:",
        "Return ONLY the rewritten content. No preamble, no explanation, no labels."
      ].join("\n");
      

     const result = streamText({
        model,
        system,
        messages: [
            {
                role: "user",
                content: "Please rewrite and improve the following content."
            }, 
            {
                role: "user",
                content: markdown,
            }
        ],
        temperature: 0
     });
     return streamToEventIterator(result.toUIMessageStream())
  })