"use client";

import { ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/src/lib/cn";
import { getUploadErrorMessage, type UploadErrorMessage } from "@/src/lib/upload-errors";
import { Spinner } from "@/src/components/ui/spinner";
import { UploadImagePreview } from "@/src/components/ui/upload-image-preview";

interface UploadBoxProps {
  status?: "default" | "uploading";
  previewUrl?: string | null;
  previewLayoutId?: string;
  maxSizeBytes?: number;
  onFileAccepted?: (file: File) => void;
  onValidationError?: (message: UploadErrorMessage) => void;
  className?: string;
}

const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export function UploadBox({
  status = "default",
  previewUrl,
  previewLayoutId,
  maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
  onFileAccepted,
  onValidationError,
  className,
}: UploadBoxProps) {
  const isUploading = status === "uploading";
  const showPreview = isUploading && Boolean(previewUrl);

  const dropzone = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: maxSizeBytes,
    disabled: isUploading,
    onDropAccepted: (files) => {
      const file = files[0];
      if (!file) return;
      onFileAccepted?.(file);
    },
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0];
      if (!firstError) {
        onValidationError?.(getUploadErrorMessage("ANALYSIS_FAILED"));
        return;
      }

      if (firstError.code === "too-many-files") {
        onValidationError?.(getUploadErrorMessage("TOO_MANY_FILES"));
        return;
      }
      if (firstError.code === "file-invalid-type") {
        onValidationError?.(getUploadErrorMessage("UNSUPPORTED_FILE_TYPE"));
        return;
      }
      if (firstError.code === "file-too-large") {
        onValidationError?.(getUploadErrorMessage("FILE_TOO_LARGE"));
        return;
      }

      onValidationError?.(getUploadErrorMessage("ANALYSIS_FAILED"));
    },
  });

  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-primary-100 bg-white p-4 text-center transition-colors",
        isDragActive && "border-primary-600 bg-primary-100/30",
        isUploading && "cursor-not-allowed",
        showPreview && "gap-0 overflow-hidden border-solid p-0",
        className,
      )}
    >
      <input {...getInputProps()} />
      {showPreview && previewUrl ? (
        <div className="relative w-full">
          <UploadImagePreview
            src={previewUrl}
            alt="업로드 중인 이미지 미리보기"
            layoutId={previewLayoutId}
            className="rounded-none"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70">
            <Spinner size="lg" tone="primary" />
            <p className="text-body-md font-semibold text-foreground">업로드 중...</p>
            <p className="text-caption text-muted-foreground">업로드를 진행하고 있습니다.</p>
          </div>
        </div>
      ) : isUploading ? (
        <>
          <Spinner size="lg" tone="primary" />
          <p className="text-body-md font-semibold text-foreground">업로드 중...</p>
          <p className="text-caption text-muted-foreground">업로드를 진행하고 있습니다.</p>
        </>
      ) : (
        <>
          <ImageIcon className="size-7 text-primary-600" />
          <p className="text-body-md font-semibold text-foreground">이미지 업로드</p>
          <p className="text-caption text-muted-foreground">JPG, PNG, WEBP / 최대 10MB</p>
        </>
      )}
    </div>
  );
}

export type { UploadBoxProps };
