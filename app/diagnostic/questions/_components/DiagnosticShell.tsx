"use client";

import React from "react";

interface DiagnosticShellProps {
  children: React.ReactNode;
}

export default function DiagnosticShell({ children }: DiagnosticShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-900">
      <div className="container mx-auto flex min-h-screen flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">{children}</div>
      </div>
    </div>
  );
}

