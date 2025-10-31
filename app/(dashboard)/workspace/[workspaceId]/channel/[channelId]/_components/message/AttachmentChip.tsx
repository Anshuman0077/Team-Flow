import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";


interface AttachmentChipProps {
    url: string;
    onRemove: () => void
}

export function AttachmentChip({url , onRemove}: AttachmentChipProps) {
    return (
        <div className="group relative w-14 h-14 rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
        {/* Image with subtle zoom on hover */}
        <Image
          src={url}
          alt="Attachment"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
  
        {/* Overlay with delete button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 group-hover:bg-black/40 group-hover:opacity-100 transition-all duration-300">
          <Button
            onClick={onRemove}
            type="button"
            size="icon"
            className="size-7 rounded-full bg-white/80 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 shadow-md transition-all"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    )
}