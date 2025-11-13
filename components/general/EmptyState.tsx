"use client";

import React from "react";
import { Cloud, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface EmptyStateProps {
  buttonText: string;
  description: string;
  href: string;
  title: string;
  className?: string;
}

export function EmptyState({
  buttonText,
  description,
  href,
  title,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center w-full h-full rounded-xl border border-dashed bg-background/40 backdrop-blur-md shadow-md p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.div
        className="mb-3 p-3 rounded-full bg-primary/10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud className="size-6 text-primary" />
      </motion.div>

      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>

      {buttonText && href && (
        <Link
          href={href}
          className={`${buttonVariants({
            variant: "default",
          })} mt-3 flex items-center gap-2 shadow-md hover:shadow-xl transition-all`}
        >
          <PlusCircle className="size-4" />
          {buttonText}
        </Link>
      )}
    </motion.div>
  );
}
