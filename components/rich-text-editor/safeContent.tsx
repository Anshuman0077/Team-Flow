import { convertJSONTOHtml } from "@/lib/json-to-html";
import { type JSONContent } from "@tiptap/react";
import parser from "html-react-parser"

import DOMPurify from "dompurify";


interface iAppProps {
    content: JSONContent;
    className?: string
}

export function SafeContent({content, className}: iAppProps ) {
  const html = convertJSONTOHtml(content)

  const clean = DOMPurify.sanitize(html)

  return (
    <div className={className}>
        {parser(clean)}
    </div>
  )
    
}