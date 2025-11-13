import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/get-avatar";
import { organization_user } from "@kinde/management-api-js";
import Image from "next/image";
import { motion } from "framer-motion";

interface MemberItemsProps {
  member: organization_user;
}

export function MemberItems({ member }: MemberItemsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="group px-3 py-2.5 hover:bg-accent/40 cursor-pointer transition-all duration-200 rounded-lg flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="size-9 ring-1 ring-border/40 shadow-sm">
            <Image
              src={getAvatar(member.picture ?? null, member.email!)}
              alt="Member Avatar"
              fill
              className="object-cover rounded-full"
            />
            <AvatarFallback className="text-sm font-semibold bg-muted">
              {member.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground truncate">
              {member.full_name}
            </p>
            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20">
              Admin
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
