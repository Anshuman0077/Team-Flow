import Image from "next/image";
import { motion } from "framer-motion";
import { Message } from "@prisma/client";
import { SafeContent } from "@/components/rich-text-editor/safeContent";

interface ThreadRepliesProps {
  message: Message;
}

export function ThreadReplies({ message }: ThreadRepliesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="
        group flex items-start gap-3 p-3 rounded-xl 
        transition-all duration-200 cursor-default
        hover:shadow-sm
        backdrop-blur-sm
      "
    >
      {/* Avatar */}
      <div className="relative">
        <Image
          src={message.authorAvatar}
          alt={message.authorName}
          width={36}
          height={36}
          className="
            rounded-full 
            border border-white/10 
            shadow-sm
            group-hover:scale-[1.02] 
            transition-transform
          "
        />

        {/* Glow on hover */}
        <div
          className="
            absolute inset-0 
            rounded-full 
            bg-primary/20 
            blur-md 
            opacity-0 
            group-hover:opacity-50 
            transition-all
          "
        />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 py-0.5">
        {/* Name + Time */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight">
            {message.authorName}
          </span>

          <span className="text-[11px] text-muted-foreground">
            {new Intl.DateTimeFormat("en-IN", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              month: "short",
              day: "numeric",
            }).format(message.createdAt)}
          </span>
        </div>

        {/* Message bubble */}

        <SafeContent  className=" mt-1 text-sm leading-6 break-words 
            backdrop-blur-sm 
            rounded-lg 
            shadow-sm
            transition-all prose dark:prose-invert max-w-none" content={JSON.parse(message.content)}  />

           
              {message.imageUrl && (
                <div className="mt-2 px-3">
                  <Image  
                   src={message.imageUrl}
                   alt="Message Attachment"
                   height={512}
                   width={512}
                    className="rounded-md max-h-[320px] w-auto object-contain p"
                  />
                </div>
              )}

         
      </div>
    </motion.div>
  );
}
