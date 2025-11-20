"use client"

import { RichTextEditor } from '@/components/rich-text-editor/Editor'
import { ImageUploadModel } from '@/components/rich-text-editor/ImageUploadModel';
import { Button } from '@/components/ui/button';
import { useAttachmentUploadType } from '@/hooks/use-attatchment';
import { ImageIcon, Send } from 'lucide-react';
import React from 'react'
import { AttachmentChip } from './AttachmentChip';

interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  onReset?: () => void;
  upload: useAttachmentUploadType;
  disabled?: boolean;
}

export const MessageComposer = ({ value, onChange, onSubmit, isSubmitting, onReset, upload }: iAppProps) => {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="gap-1"
          >
            <Send className="size-4" />
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        }
        footerLeft={
          upload.stageUrl ? (
            <div className="flex items-center gap-2">
              <AttachmentChip onRemove={upload.clear} url={upload.stageUrl} />
            </div>
          ) : (
            <Button
              onClick={() => upload.setOpen(true)}
              disabled={isSubmitting}
              type="button"
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <ImageIcon className="size-4" />
              Attach
            </Button>
          )
        }
        onReset={onReset}
        isSubmitting={isSubmitting}
      />

      <ImageUploadModel
        onUploaded={(url) => upload.onUploading(url)}
        open={upload.isOpen}
        onOpenChange={upload.setOpen}
      />
    </>
  )
}