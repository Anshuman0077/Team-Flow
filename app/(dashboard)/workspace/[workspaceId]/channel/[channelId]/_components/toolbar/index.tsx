import { Button } from "@/components/ui/button";
import { useThread } from "@/provider/ThreadProvider";
import {MessageSquareText, Pencil } from "lucide-react";


interface toolbarProps {
    messageId: string;
    canEdit: boolean;  // ✅ string ❌ → boolean ✔
    onEdit: () => void;
}


export function MessageHoverToolBar({
    messageId,
    canEdit,
    onEdit
} : toolbarProps) {
    const {toggleThread} = useThread()
    return (
        <div className="absolute -right-2 -top-2 items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur transition-opacity opacity-0 group-hover:opacity-100 dark:border-neutral-800 dark:bg-neutral-900/90"> 
           {canEdit && (
                <Button variant="ghost" size="icon"  onClick={onEdit}>
                    <Pencil className="size-5" />
                </Button>
           )}
           

            <Button variant="ghost" size="icon" onClick={() => toggleThread(messageId)}>
                <MessageSquareText className="size-5" />
            </Button>
        </div>
    )
}