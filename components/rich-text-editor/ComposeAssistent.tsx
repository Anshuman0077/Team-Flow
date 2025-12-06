import { Sparkle } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/server";
import { client } from "@/lib/orpc";


interface ComposeAssistentProps {
    content: string
    OnAccept?: (markdown:string) => void;
}


export function ComposeAssistent( {content, OnAccept} : ComposeAssistentProps) {

    const [open , setOpen] = useState(false)
    const contenRef = useRef(content)

     useEffect(() => {
        contenRef.current = content
     }, [content])

    const {messages , status ,error , sendMessage, setMessages , stop , clearError} = useChat({
        id: `compose-assistent`,
        transport: {
            async sendMessages(options) {
                return eventIteratorToStream(

                    await client.ai.compose.generate(
                        {content: contenRef.current},
                        {signal: options.abortSignal}
                    )

                )
            },
            reconnectToStream() {
                throw new Error("UnSupported")
            }
        }
    })

    const lastAssistant = messages.findLast((m) => m.role === "assistant");

    const ComposeText =
      lastAssistant?.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("\n\n") ?? "";



    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen);

      if (nextOpen) {
        const hasAssistantMessage = messages.some((m) => m.role === "assistant");
        if (status !== "ready" || hasAssistantMessage) return;

        sendMessage({text: "Rewrite"});

         
      } else {
        stop();
        clearError();
        setMessages([]);
      }
    }





    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
        {/* ========================= TRIGGER BUTTON ========================= */}
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            className={`
              relative overflow-hidden rounded-full 
              bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 
              text-white shadow-md
              hover:shadow-xl hover:scale-[1.04] active:scale-95
              transition-all duration-300 ease-out
              focus-visible:ring-2 focus-visible:ring-fuchsia-400
            `}
          >
            <span className="absolute inset-0 rounded-full opacity-0 hover:opacity-25 bg-white transition-opacity duration-300" />
            <span className="flex items-center gap-1.5 relative z-10">
              <Sparkle className="size-3.5 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide">
                Compose
              </span>
            </span>
          </Button>
        </PopoverTrigger>
        {/* ========================= POPUP PANEL ========================= */}
      <PopoverContent
        className={`
          w-[26rem] rounded-xl overflow-hidden border
          bg-gradient-to-br from-white/40 via-white/20 to-white/5
          backdrop-blur-xl shadow-2xl border-white/40
          animate-in fade-in zoom-in-95 duration-300
        `}
      >
        {/* ========================= HEADER BAR ========================= */}
        <div
          className={`
            flex items-center justify-between px-4 py-3 rounded-lg
            bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600
            text-white shadow-md
          `}
        >
          <div className="flex items-center gap-2">
            <span
              className="
                inline-flex items-center gap-1.5 
                rounded-full bg-white/20 px-3 py-1.5 
                backdrop-blur-md shadow-sm
              "
            >
              <Sparkle className="size-3.5 animate-pulse" />
              <span className="text-sm font-semibold">Compose Assitent ( Preview )</span>
            </span>
          </div>

          {status === "streaming" && (
            <Button
              onClick={() => stop()}
              type="button"
              size="sm"
              variant="outline"
              className="text-white bg-white/20 hover:bg-white/30 border-white/30"
            >
              Stop
            </Button>
          )}
        </div>

        {/* ========================= CONTENT BODY ========================= */}
        <div className="px-4 py-4 text-sm text-black/80 max-h-80 overflow-y-auto custom-scroll">
          {/* ↻ ERROR STATE */}
          {error ? (
            <div className="space-y-3">
              <p className="text-red-500 text-sm font-medium">{error.message}</p>

              <Button
                type="button"
                size="sm"
                className="
                  bg-gradient-to-r from-violet-600 to-fuchsia-600 
                  text-white font-medium shadow 
                  hover:shadow-lg transition
                "
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({ text: "Summarize Thread" });
                }}
              >
                Try Again
              </Button>
            </div>
          ) : ComposeText ? (
            /* ✓ SUMMARY CONTENT */
            <p className="leading-relaxed ">{ComposeText}</p>
          ) : status === "submitted" || status === "streaming" ? (
            /* ⏳ LOADING / SKELETON */
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />    
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            /* 🟣 IDLE STATE */
            <div className="text-sm text-muted-foreground">
              Click summarize to generate.
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t pz-3 py-2 bg-muted/30">
            <Button 
             type="submit"
             size="sm"
             variant="outline"
             onClick={() => {
                clearError();
                setMessages([]);
                setOpen(false)
                sendMessage({text: "Summ"})
             }}
            >
                Decline
            </Button>
            <Button
            type="submit"
            size="sm"
            onClick={() => {
                if (!ComposeText) return;
                OnAccept?.(ComposeText)
                stop();
                clearError();
                setMessages([]);
                setOpen(false)

            }}
            disabled={!ComposeText}
            >
                Accept
            </Button>
        </div>
      </PopoverContent>
        </Popover> 

    )
}