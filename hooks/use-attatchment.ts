
"use client";

import { useCallback, useMemo, useState } from "react";



export function useAttachmentUpload() {
    const [isOpen , setOpen] = useState(false)
    const [ stageUrl , setStageUrl ] = useState<string | null>(null);
    const [isUploading , setIsUploading] = useState(false)

    

    const onUploading = useCallback((url:string) => {
        setStageUrl(url);
        setIsUploading(false)
        setOpen(false);
       
    }, [])

    const clear = useCallback(() => {
        setStageUrl(null)
        setIsUploading(false)
    }, [])

    return useMemo(() => ({
        isOpen,
        setOpen,
        isUploading,
        stageUrl,
        onUploading,
        clear,
    }) , [isOpen , setOpen, onUploading, stageUrl , isUploading, clear])
} 

export type useAttachmentUploadType = ReturnType<typeof useAttachmentUpload>