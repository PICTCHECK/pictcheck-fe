'use client';

import type { MultilineCopy } from '@/src/lib/multiline-copy';
import { isMultilineCopyLines } from '@/src/lib/multiline-copy';

type MultilineTextProps = {
  copy: MultilineCopy;
  className?: string;
};

export function MultilineText({ copy, className }: MultilineTextProps) {
  if (!isMultilineCopyLines(copy)) {
    return <span className={className}>{copy}</span>;
  }

  return (
    <span className={className}>
      {copy.map((line, index) => (
        <span key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </span>
  );
}
