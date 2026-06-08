'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function BottomSheet({ open, onOpenChange, children, className, 'aria-label': ariaLabel }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 mx-auto max-w-[390px]">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={cn(
              'absolute inset-x-0 bottom-0 max-h-[min(92dvh,720px)] overflow-y-auto rounded-t-[24px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3 shadow-[0_-12px_40px_rgba(17,24,39,0.14)]',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 360 }}
          >
            <div className="mx-auto mb-4 h-[5px] w-9 rounded-full bg-[#D1D6DB]" aria-hidden />
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
