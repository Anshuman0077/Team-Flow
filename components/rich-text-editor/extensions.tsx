
import React from 'react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { all, createLowlight } from 'lowlight'
import { Placeholder } from '@tiptap/extensions/placeholder'

const lowlight = createLowlight(all)

export const  baseExtensions = [
    StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-muted p-4 font-mono text-sm',
          },
        },
        bold: {
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
        italic: {
          HTMLAttributes: {
            class: 'italic',
          },
        },
        strike: {
          HTMLAttributes: {
            class: 'line-through',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'rounded bg-muted px-1.5 py-0.5 font-mono text-sm',
          },
        },
      }),
    
    TextAlign.configure({
        types: ["heading" , "paragraph"],
    }),
    CodeBlockLowlight.configure({
        lowlight,
    })

]

export  const editorExtensions = [
    ...baseExtensions , Placeholder.configure({
        placeholder: "Type your Message",
    })
]