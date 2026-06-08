"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/cn";

interface FloatingActionBarProps {
  children?: ReactNode;
  actions?: ReactNode[];
  className?: string;
  innerClassName?: string;
}

export function FloatingActionBar({ children, actions, className, innerClassName }: FloatingActionBarProps) {
  const resolvedChildren = children ?? actions;

  if (!resolvedChildren) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-[390px] p-3",
          innerClassName,
        )}
      >
        <div className="flex flex-col gap-2">{resolvedChildren}</div>
      </div>
    </div>
  );
}
