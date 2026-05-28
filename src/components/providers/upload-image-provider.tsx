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
import type { PictcheckAnalysisResult } from "@/src/lib/analysis/types";

type ImageDimensions = { width: number; height: number } | null;

type UploadImageContextValue = {
  file: File | null;
  previewUrl: string | null;
  dimensions: ImageDimensions;
  analysisResult: PictcheckAnalysisResult | null;
  setFile: (file: File) => void;
  setAnalysisResult: (analysisResult: PictcheckAnalysisResult | null) => void;
  clearFile: () => void;
};

const UploadImageContext = createContext<UploadImageContextValue | null>(null);

export function UploadImageProvider({ children }: PropsWithChildren) {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<ImageDimensions>(null);
  const [analysisResult, setAnalysisResult] = useState<PictcheckAnalysisResult | null>(null);

  const setFile = useCallback((newFile: File) => {
    setFileState(newFile);
    setDimensions(null);
    setAnalysisResult(null);
    setPreviewUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(newFile);
    });
  }, []);

  const clearFile = useCallback(() => {
    setFileState(null);
    setAnalysisResult(null);
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
      analysisResult,
      setFile,
      setAnalysisResult,
      clearFile,
    }),
    [file, previewUrl, dimensions, analysisResult, setFile, clearFile],
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
