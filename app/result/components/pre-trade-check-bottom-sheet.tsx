'use client';

import { useState } from 'react';
import { Copy, Lock } from 'lucide-react';
import { BottomSheet, MultilineText } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import { multilineCopyToPlainText } from '@/src/lib/multiline-copy';
import type { MultilineCopy } from '@/src/lib/multiline-copy';
import type { RiskLevel } from '@/src/lib/risk-styles';
import {
  getPreTradeGuideContent,
  getPreTradeGuideTheme,
  type PreTradeGuideAction,
  type PreTradeGuideTheme,
} from '../constants/pre-trade-guide-content';

function PreTradeReassuranceBox({ copy, theme }: { copy: MultilineCopy; theme: PreTradeGuideTheme }) {
  return (
    <div className={cn('rounded-2xl border px-5 py-5 text-center', theme.reassuranceBox, theme.reassuranceBorder)}>
      <p className="text-[15px] font-medium leading-[1.55] tracking-[-0.02em] text-[#333D4B]">
        <MultilineText copy={copy} />
      </p>
    </div>
  );
}

function PreTradeGuideActionRow({ action, theme }: { action: PreTradeGuideAction; theme: PreTradeGuideTheme }) {
  const ActionIcon = action.icon;

  return (
    <li className="flex gap-3">
      <span
        className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', theme.actionIconWrap)}
      >
        <ActionIcon className={cn('size-[18px]', theme.actionIcon)} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[15px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#191F28]">{action.title}</p>
        {action.description ? (
          <p className="mt-1 text-[14px] leading-[1.45] tracking-[-0.01em] text-[#8B95A1]">{action.description}</p>
        ) : null}
      </div>
    </li>
  );
}

interface PreTradeCheckBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: RiskLevel;
  suspicionDetected: boolean;
}

export function PreTradeCheckBottomSheet({
  open,
  onOpenChange,
  level,
  suspicionDetected,
}: PreTradeCheckBottomSheetProps) {
  const content = getPreTradeGuideContent(level, suspicionDetected);
  const theme = getPreTradeGuideTheme(level);
  const sellerMessageText = content.sellerMessage ? multilineCopyToPlainText(content.sellerMessage) : '';
  const [copied, setCopied] = useState(false);
  const showReassuranceBubble = content.reassuranceBubble != null;
  const showSellerSection = content.showCopyButton && content.sellerMessage != null;

  const handleCopy = async () => {
    if (!sellerMessageText) return;
    try {
      await navigator.clipboard.writeText(sellerMessageText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setCopied(false);
    onOpenChange(nextOpen);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      aria-label="거래 전 확인 방법"
      className="px-0 pb-[calc(env(safe-area-inset-bottom)+20px)]"
    >
      <div className="px-5">
        <div className="pt-6" />

        {content.actions.length > 0 ? (
          <section aria-label="추천 행동">
            <h3 className="mb-4 text-[14px] font-bold tracking-[-0.01em] text-[#2e2e2e]">추천 행동</h3>
            <ul className="space-y-5">
              {content.actions.map((action) => (
                <PreTradeGuideActionRow key={action.title} action={action} theme={theme} />
              ))}
            </ul>
          </section>
        ) : null}

        {showReassuranceBubble ? (
          <section className={cn(content.actions.length > 0 && 'mt-8')} aria-label="분석 안내">
            <PreTradeReassuranceBox copy={content.reassuranceBubble!} theme={theme} />
          </section>
        ) : null}

        {showSellerSection ? (
          <section className="mt-8" aria-label="판매자 요청 문구">
            <h3 className="mb-3 text-[14px] font-bold tracking-[-0.01em] text-[#2e2e2e]">
              판매자에게 요청할 문구 복사하기
            </h3>
            <div className="rounded-2xl bg-[#F2F4F6] px-4 py-4">
              <p className="whitespace-pre-line text-[15px] leading-[1.55] tracking-[-0.02em] text-[#333D4B]">
                <MultilineText copy={content.sellerMessage!} />
              </p>
            </div>
            {content.showCopyButton ? (
              <button
                type="button"
                className="mt-3 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-[#E5E8EB] bg-white text-[15px] font-semibold tracking-[-0.02em] text-[#333D4B] transition-colors active:bg-[#F9FAFB]"
                onClick={handleCopy}
              >
                <Copy className="size-[18px] text-[#6B7684]" strokeWidth={1.75} aria-hidden />
                {copied ? '복사되었어요' : '문구 복사'}
              </button>
            ) : null}
          </section>
        ) : null}

        {showSellerSection ? (
          <p className="mt-6 flex items-start justify-center gap-1.5 pb-1 text-center text-[12px] leading-[1.45] text-[#8B95A1]">
            <Lock className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>요청 문구는 의심 신호를 더 정확히 파악하기 위한 참고용입니다.</span>
          </p>
        ) : (
          <div className="pb-1" />
        )}
      </div>
    </BottomSheet>
  );
}
