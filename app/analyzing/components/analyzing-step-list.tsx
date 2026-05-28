'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle } from 'lucide-react';
import { ACTIVE_ITEM_TRANSITION, ANALYZING_STEP_RANGES, ANALYZING_STEPS } from '../constants/analyzing.constants';

export function AnalyzingStepList({ progress }: { progress: number }) {
  return (
    <div className="mt-8 space-y-4 px-2">
      {ANALYZING_STEPS.map((step, index) => {
        const { start, end } = ANALYZING_STEP_RANGES[index];
        const isCompleted = progress > end || progress === 100;
        const isActive = !isCompleted && progress >= start && progress <= end;
        const isPending = !isCompleted && !isActive;

        return (
          <motion.div
            key={step}
            className="flex items-center gap-3"
            initial={false}
            animate={
              isActive
                ? {
                    opacity: [0.35, 1],
                    y: [10, 0],
                    scale: [0.98, 1.04, 1],
                  }
                : {
                    opacity: isPending ? 0.5 : 1,
                    y: 0,
                    scale: 1,
                  }
            }
            transition={ACTIVE_ITEM_TRANSITION}
          >
            <div className="flex size-6 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {isCompleted ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0.8, opacity: 0.65 }}
                    animate={{ scale: [0.8, 1.12, 1], opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex size-6 items-center justify-center rounded-full bg-primary-600"
                  >
                    <Check className="size-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    key="active"
                    initial={{ scale: 0.94, opacity: 0.35 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.94, opacity: 0 }}
                    transition={{ duration: 0.36, ease: 'easeOut' }}
                    className="flex size-6 items-center justify-center rounded-full border-2 border-primary-600"
                  >
                    <LoaderCircle className="size-4 animate-spin text-primary-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ scale: 0.95, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="size-6 rounded-full border-2 border-gray-300"
                  />
                )}
              </AnimatePresence>
            </div>
            <p
              className={`text-body-sm leading-tight transition-colors duration-300 ${
                isCompleted || isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              {step}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
