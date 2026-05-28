"use client";

import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/cn";
import { Button } from "@/src/components/ui/button";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSettingButton?: boolean;
  onBackClick?: () => void;
  onSettingClick?: () => void;
  className?: string;
}

export function Header({
  title,
  showBackButton = false,
  showSettingButton = false,
  onBackClick,
  onSettingClick,
  className,
}: HeaderProps) {
  const router = useRouter();
  const showLogo = !title && !showBackButton;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center justify-between bg-white px-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {showBackButton ? (
          <Button
            variant="tertiary"
            size="sm"
            aria-label="뒤로가기"
            onClick={onBackClick ?? (() => router.back())}
            className="size-8 rounded-full border-0 px-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        {showLogo ? (
          <div className="flex items-center gap-2">
            <img src="/pictcheck_favicon.svg" alt="PictCheck 로고" className="size-6" />
            <span className="text-body-lg font-bold tracking-[-0.01em] text-foreground">
              PictCheck
            </span>
          </div>
        ) : null}
      </div>

      {title ? (
        <h1 className="absolute left-1/2 max-w-[52vw] -translate-x-1/2 truncate text-body-lg font-bold text-foreground">
          {title}
        </h1>
      ) : null}

      <div className="flex min-w-0 items-center justify-end">
        {showSettingButton ? (
          <Button
            variant="tertiary"
            size="sm"
            aria-label="설정"
            onClick={onSettingClick}
            className="size-8 rounded-full border-0 px-0"
          >
            <Settings className="size-4" />
          </Button>
        ) : (
          <div className="size-8" />
        )}
      </div>
    </header>
  );
}

export type { HeaderProps };
