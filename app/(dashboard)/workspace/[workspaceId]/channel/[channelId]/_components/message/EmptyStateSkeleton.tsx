"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function EmptyStateSkeleton() {
  return (
    <motion.div
      className="flex flex-col h-full justify-center items-center text-center p-6 rounded-xl border border-dashed bg-background/40 backdrop-blur-md shadow-md w-full max-w-lg mx-auto"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Animated floating icon placeholder */}
      <motion.div
        className="mb-3 p-3 rounded-full bg-primary/10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Skeleton className="h-6 w-6 rounded-full" />
      </motion.div>

      {/* Title skeleton */}
      <Skeleton className="h-5 w-48 rounded-md mb-2" />
      
      {/* Description skeleton */}
      <Skeleton className="h-4 w-64 rounded-md mb-3" />

      {/* Button skeleton */}
      <Skeleton className="h-9 w-44 rounded-lg mb-4" />
    </motion.div>
  );
}