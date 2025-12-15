"use client";

import React from "react";

type QuestionPayload = {
  question_uuid: string;
  stem: string;
  options: Record<string, string>;
};

interface QuestionCardProps {
  question: QuestionPayload;
  selectedOption?: string;
  onSelect: (optionKey: string) => void;
}

const OPTION_ORDER = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({
  question,
  selectedOption,
  onSelect,
}: QuestionCardProps) {
  const sortedKeys = Object.keys(question.options).sort((a, b) => {
    const indexA = OPTION_ORDER.indexOf(a);
    const indexB = OPTION_ORDER.indexOf(b);
    if (indexA === -1 || indexB === -1) return a.localeCompare(b);
    return indexA - indexB;
  });

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-base text-gray-700">{question.stem}</p>
      <div className="mt-5 space-y-3">
        {sortedKeys.map((optionKey) => (
          <label
            key={optionKey}
            className={`flex cursor-pointer items-center space-x-4 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              selectedOption === optionKey
                ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200"
            }`}
          >
            <input
              type="radio"
              name={question.question_uuid}
              value={optionKey}
              checked={selectedOption === optionKey}
              onChange={() => onSelect(optionKey)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="mr-2 font-bold">{optionKey}.</span>
              <span>{question.options[optionKey]}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

