"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type ImageDimensions = { width: number; height: number } | null;

type UploadImageContextValue = {
  file: File | null;
  previewUrl: string | null;
  dimensions: ImageDimensions;
  setFile: (file: File) => void;
  clearFile: () => void;
};

const UploadImageContext = createContext<UploadImageContextValue | null>(null);

export function UploadImageProvider({ children }: PropsWithChildren) {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions>(null);

  const setFile = useCallback((newFile: File) => {
    setFileState(newFile);
    setDimensions(null);
    setPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(newFile);
    });
  }, []);

  const clearFile = useCallback(() => {
    setFileState(null);
    setPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    setDimensions(null);
  }, []);

  useEffect(() => {
    if (!previewUrl) return;

    const img = new window.Image();
    let cancelled = false;

    img.onload = () => {
      if (!cancelled) {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.src = previewUrl;

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      setPreviewUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
    };
  }, []);

  const value = useMemo(
    () => ({
      file,
      previewUrl,
      dimensions,
      setFile,
      clearFile,
    }),
    [file, previewUrl, dimensions, setFile, clearFile],
  );

  return <UploadImageContext.Provider value={value}>{children}</UploadImageContext.Provider>;
}

export function useUploadImage() {
  const context = useContext(UploadImageContext);
  if (!context) {
    throw new Error("useUploadImage must be used within UploadImageProvider");
  }
  return context;
}
