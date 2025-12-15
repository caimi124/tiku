"use client";

import React from "react";

interface NavButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  nextDisabled?: boolean;
  submitting?: boolean;
}

export default function NavButtons({
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  nextDisabled = false,
  submitting = false,
}: NavButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
      >
        上一题
      </button>
      {!isLast ? (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 rounded-2xl border border-transparent bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-200"
        >
          下一题
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={nextDisabled || submitting}
          className="flex-1 rounded-2xl border border-transparent bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-200"
        >
          {submitting ? "提交中..." : "提交诊断"}
        </button>
      )}
    </div>
  );
}

