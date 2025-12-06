
import { baseExtensions } from "@/components/rich-text-editor/extensions";
import { renderToMarkdown  } from "@tiptap/static-renderer/pm/markdown"


function normalizeWhiteSpace(markdown: string) {
    return markdown
      .replace(/\s+$/gm, "")       // trim trailing spaces per line
      .replace(/\n{3,}/g, "\n\n")  // collapse 3+ blank lines into 2
      .trim();                     // final trim
  }
  




export async function tipTapJsonToMarkdown(json: string) {
    // parse json
    let content;
    try {
        content = JSON.parse(json)
    } catch {
        return "";
    }

    const markdown = renderToMarkdown({
        extensions: baseExtensions,
        content: content,
    });

    return normalizeWhiteSpace(markdown)

}