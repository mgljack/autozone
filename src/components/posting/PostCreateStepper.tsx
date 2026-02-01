"use client";

import React from "react";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

interface PostCreateStepperProps {
  currentStep?: 1 | 2 | 3;
}

export function PostCreateStepper({ currentStep = 1 }: PostCreateStepperProps) {
  const { t } = useI18n();

  const steps = [
    { number: 1, label: t("sell_stepper_basicInfo") },
    { number: 2, label: t("sell_stepper_category") },
    { number: 3, label: t("sell_stepper_preview") },
  ];

  return (
    <div className="flex items-center justify-between" role="group" aria-label={t("sell_stepper_label")}>
      {steps.map((step, idx) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-rose-600 bg-rose-600 text-white"
                      : isCompleted
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-zinc-300 bg-white text-zinc-400",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium sm:text-sm",
                    isActive ? "text-zinc-900" : isCompleted ? "text-zinc-700" : "text-zinc-400",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 transition-colors sm:mx-4",
                  isCompleted ? "bg-rose-600" : "bg-zinc-200",
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

