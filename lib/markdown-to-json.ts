import { editorExtensions } from '@/components/rich-text-editor/extensions';
import { generateJSON } from '@tiptap/react';
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
});

export function markdownToJson(markdown: string) {
  const html = md.render(markdown);

  const cleanHtml = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });

  return generateJSON(cleanHtml, editorExtensions);
}
