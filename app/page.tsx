'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Cuboid, ImageIcon, Lock, Sparkles, Sun } from 'lucide-react';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { Button, Card, Header, toastError, UploadBox, UploadImagePreview } from '@/src/components/ui';
import { formatFileSize } from '@/src/lib/format-file-size';

type UploadState = 'idle' | 'uploading' | 'uploaded';

const PREVIEW_LAYOUT_ID = 'upload-preview';

const ANALYSIS_ITEMS = [
  { label: 'AI 생성 패턴 분석', icon: Sparkles },
  { label: '광원 및 그림자 분석', icon: Sun },
  { label: '텍스처 및 반복 패턴 분석', icon: ImageIcon },
  { label: '구조적 왜곡 및 이상 여부 확인', icon: Cuboid },
];

export default function HomePage() {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const { file, previewUrl, dimensions, setFile, clearFile } = useUploadImage();

  const uploadBoxStatus = useMemo(() => (uploadState === 'uploading' ? 'uploading' : 'default'), [uploadState]);

  const fileMetaLabel = useMemo(() => {
    if (!file) return null;
    const sizeLabel = formatFileSize(file.size);
    if (!dimensions) return `${sizeLabel}`;
    return `${sizeLabel} • ${dimensions.width} × ${dimensions.height}`;
  }, [file, dimensions]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header className="rounded-b-2xl" />
      <div className="space-y-4 px-4 pb-8 pt-3">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between bg-linear-to-r from-primary-100/60 to-white px-4 py-4">
            <div className="space-y-1">
              <p className="text-title-lg font-semibold leading-tight tracking-[-0.03em] text-primary-600">
                AI로 의심되는 사진을
              </p>
              <p className="text-title-md font-semibold leading-tight tracking-[-0.03em]">업로드하세요</p>
              <p className="pt-1 text-caption text-muted-foreground">AI가 생성했을 가능성을 분석하고</p>
              <p className="text-caption text-muted-foreground">결과와 근거를 알려드립니다.</p>
            </div>
            <div className="relative size-20 shrink-0">
              <Image
                src="/pictcheck_home_icon.svg"
                alt="AI 이미지 분석 일러스트"
                width={80}
                height={80}
                unoptimized
                className="size-20 object-contain"
              />
            </div>
          </div>
        </Card>

        {uploadState === 'uploaded' && previewUrl && file ? (
          <Card className="space-y-3 p-3">
            <UploadImagePreview src={previewUrl} alt="업로드된 이미지 미리보기" layoutId={PREVIEW_LAYOUT_ID} />
            <div className="space-y-1 px-1">
              <p className="truncate text-body-lg leading-tight">{file.name}</p>
              {fileMetaLabel ? <p className="text-body-sm text-muted-foreground">{fileMetaLabel}</p> : null}
            </div>
          </Card>
        ) : (
          <UploadBox
            status={uploadBoxStatus}
            previewUrl={previewUrl}
            previewLayoutId={PREVIEW_LAYOUT_ID}
            className="min-h-[300px]"
            onFileAccepted={(acceptedFile) => {
              setFile(acceptedFile);
              setUploadState('uploading');
              setTimeout(() => setUploadState('uploaded'), 1400);
            }}
            onValidationError={(message) => toastError(message)}
          />
        )}

        <Card className="space-y-2 px-4 py-5">
          <h2 className="text-body-md font-semibold tracking-[-0.02em]">분석 항목</h2>
          {ANALYSIS_ITEMS.map((item) => (
            <div key={item.label} className="border-b border-gray-100 py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="flex size-5 items-center justify-center rounded-md">
                  <item.icon className="size-4 text-primary-600" />
                </div>
                <p className="text-body-sm leading-tight">{item.label}</p>
              </div>
            </div>
          ))}
        </Card>

        {uploadState === 'uploaded' ? (
          <>
            <Link href="/analyzing" className="block">
              <Button size="lg" className="h-12 w-full">
                분석 시작
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              className="h-12 w-full"
              onClick={() => {
                clearFile();
                setUploadState('idle');
              }}
            >
              다른 이미지 선택
            </Button>
          </>
        ) : null}

        <p className="flex items-center justify-center gap-2 pt-2 text-caption text-muted-foreground">
          <Lock className="size-3.5" />
          업로드한 이미지는 분석 후 즉시 삭제됩니다.
        </p>
      </div>
    </main>
  );
}
