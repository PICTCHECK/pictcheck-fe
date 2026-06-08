'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Car, Gem, Laptop, Lock, Search } from 'lucide-react';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import {
  Button,
  Card,
  FloatingActionBar,
  Header,
  toastError,
  UploadBox,
  UploadImagePreview,
} from '@/src/components/ui';
import { formatFileSize } from '@/src/lib/format-file-size';

type UploadState = 'idle' | 'uploading' | 'uploaded';

const PREVIEW_LAYOUT_ID = 'upload-preview';

const ANALYSIS_ITEMS = [
  { label: '판매자가 올린 상품 사진이 의심될 때', icon: Search },
  { label: '고가 전자기기 거래 전 확인이 필요할 때', icon: Laptop },
  { label: '명품 판매 사진의 진위가 궁금할 때', icon: Gem },
  { label: '오토바이·차량 부품 거래가 불안할 때', icon: Car },
];

export default function Page() {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const { file, previewUrl, dimensions, setFile, clearFile } = useUploadImage();

  const uploadBoxStatus = useMemo(() => (uploadState === 'uploading' ? 'uploading' : 'default'), [uploadState]);

  const fileMetaLabel = useMemo(() => {
    if (!file) return null;
    const sizeLabel = formatFileSize(file.size);
    if (!dimensions) return `${sizeLabel}`;
    return `${sizeLabel} • ${dimensions.width} × ${dimensions.height}`;
  }, [file, dimensions]);

  const shouldShowFloatingActions = uploadState === 'uploaded';

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header className="rounded-b-2xl" />
      <div
        className={`space-y-4 px-4 pt-3 ${
          shouldShowFloatingActions ? 'pb-[calc(env(safe-area-inset-bottom)+144px)]' : 'pb-8'
        }`}
      >
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between bg-linear-to-r from-primary-100/80 via-sky-50/70 to-amber-50/80 px-4 py-4">
            <div className="space-y-1">
              <p className="text-title-md font-semibold leading-tight tracking-[-0.03em]">
                <span className="text-primary-600">거래 전</span>
                <span>, 이 상품 사진</span>
              </p>
              <p className="text-title-md font-semibold leading-tight tracking-[-0.03em]">믿어도 될까?</p>
              <p className="pt-1 text-caption text-muted-foreground">AI 생성 가능성과 시각적 이상을 분석해</p>
              <p className="text-caption text-muted-foreground">안전한 거래를 도와드립니다.</p>
            </div>
            <div className="relative size-24 shrink-0">
              <Image
                src="/pictcheck_home_icon.svg"
                alt="AI 이미지 분석 일러스트"
                width={120}
                height={120}
                unoptimized
                className="size-36 object-contain"
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
          <h2 className="text-body-md font-semibold tracking-[-0.02em]">이런 경우 사용해보세요</h2>
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

        <p className="flex items-center justify-center gap-2 pt-2 text-caption text-muted-foreground">
          <Lock className="size-3.5" />
          업로드한 이미지는 분석 후 즉시 삭제됩니다.
        </p>
      </div>
      {shouldShowFloatingActions ? (
        <FloatingActionBar>
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
        </FloatingActionBar>
      ) : null}
    </main>
  );
}
