"use client";

import { Button } from "@/components/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EmojiReactionProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiReaction({ onSelect, disabled }: EmojiReactionProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            "size-7 rounded-full flex items-center justify-center",
            "hover:bg-muted transition-all",
            "active:scale-95",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          <SmilePlus className="size-4 text-muted-foreground hover:text-primary transition" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-fit p-0 shadow-md border">
        <EmojiPicker
          className="h-[340px]"
          onEmojiSelect={(e) => handleEmojiSelect(e.emoji)}
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
          <EmojiPickerFooter className="text-xs text-muted-foreground" />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}
