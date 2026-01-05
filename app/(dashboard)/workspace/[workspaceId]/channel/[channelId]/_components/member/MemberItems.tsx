import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/get-avatar";
import { organization_user } from "@kinde/management-api-js";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, Users } from "lucide-react";

interface MemberItemsProps {
  member: organization_user;
  isOnline?: boolean;
}

export function MemberItems({ member, isOnline }: MemberItemsProps) {
  const isAdmin = member.roles?.includes("admin");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer",
        "transition-all duration-200",
        isAdmin
          ? "bg-gradient-to-r from-amber-50/60 to-transparent hover:from-amber-100/60 dark:from-amber-500/10"
          : "hover:bg-accent/40"
      )}
    >
      {/* Avatar */}
      <div className="relative">
        {/* Online glow */}
        {isOnline && (
          <span className="absolute -inset-1 rounded-full bg-green-500/20 blur-md" />
        )}

        <Avatar
          className={cn(
            "relative size-9 ring-1 shadow-sm",
            isAdmin ? "ring-amber-400/50" : "ring-border/40"
          )}
        >
          <Image
            src={getAvatar(member.picture ?? null, member.email ?? "")}
            alt="Member Avatar"
            fill
            className="object-cover rounded-full"
          />
          <AvatarFallback className="text-sm font-semibold bg-muted">
            {member.full_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Online dot */}
        <span
          className={cn(
            "absolute bottom-0 right-0 z-20 size-2.5 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-muted-foreground/40"
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-sm font-medium",
              isAdmin ? "text-amber-700 dark:text-amber-300" : "text-foreground"
            )}
          >
            {member.full_name}
          </p>

          {isAdmin ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5",
                "text-[10px] font-semibold uppercase tracking-wide",
                "bg-gradient-to-r from-amber-100 to-yellow-100",
                "text-amber-800 ring-1 ring-amber-500/20",
                "dark:from-amber-400/10 dark:to-yellow-400/10",
                "dark:text-amber-300 dark:ring-amber-400/30"
              )}
            >
              <ShieldCheck className="size-3" />
              Admin
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5",
                "text-[10px] font-medium uppercase tracking-wide",
                "bg-muted text-muted-foreground",
                "ring-1 ring-border/40",
                "dark:bg-muted/40 dark:text-muted-foreground"
              )}
            >
              <Users className="size-3" />
              User
            </span>
          )}
        </div>

        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
    </motion.div>
  );
}
