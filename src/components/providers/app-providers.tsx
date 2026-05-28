"use client";

import type { PropsWithChildren } from "react";
import { UploadImageProvider } from "@/src/components/providers/upload-image-provider";
import { Toaster } from "@/src/components/ui/toast";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <UploadImageProvider>
      {children}
      <Toaster />
    </UploadImageProvider>
  );
}
