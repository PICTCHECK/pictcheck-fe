const WAITING_MESSAGES = [
  '마지막 의심 요소를 정리하고 있어요',
  '분석 결과를 정리하는 중입니다',
  '조금만 기다려주세요. 결과를 확인하고 있어요',
] as const;

type Props = {
  isFinalizing: boolean;
  waitingMessageIndex: number;
};

export function AnalyzingStatusMessage({ isFinalizing, waitingMessageIndex }: Props) {
  const waitingMessage = WAITING_MESSAGES[waitingMessageIndex % WAITING_MESSAGES.length];

  return (
    <div className="mt-12 space-y-1 rounded-2xl border border-primary-100 bg-primary-100/20 px-4 py-3 text-center text-caption text-muted-foreground">
      <p>{isFinalizing ? waitingMessage : 'AI 흔적을 분석하고 있습니다.'}</p>
      <p>
        {isFinalizing ? '분석 완료 전까지 잠시만 기다려주세요' : '분석에는 보통 3~8초 정도 소요될 수 있습니다'}
      </p>
      {isFinalizing ? (
        <div className="flex items-center justify-center gap-1 pt-1" aria-label="로딩 중">
          <span className="size-1.5 rounded-full bg-primary-500/70 animate-pulse" />
          <span className="size-1.5 rounded-full bg-primary-500/70 animate-pulse [animation-delay:160ms]" />
          <span className="size-1.5 rounded-full bg-primary-500/70 animate-pulse [animation-delay:320ms]" />
        </div>
      ) : null}
    </div>
  );
}
