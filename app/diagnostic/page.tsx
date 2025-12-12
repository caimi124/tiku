"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const LICENSE_OPTIONS = [
  {
    id: "tcm",
    title: "Licensed Pharmacist – Traditional Chinese Medicine",
    subtitle: "执业药师（中药）",
  },
  {
    id: "western",
    title: "Licensed Pharmacist – Western Medicine",
    subtitle: "执业药师（西药）",
  },
] as const;

const SUBJECT_MAP: Record<
  (typeof LICENSE_OPTIONS)[number]["id"],
  { id: string; title: string }[]
> = {
  tcm: [
    { id: "tcm-1", title: "中药学专业知识（一）" },
    { id: "tcm-2", title: "中药学专业知识（二）" },
    { id: "tcm-3", title: "中药学综合知识与技能" },
  ],
  western: [
    { id: "western-1", title: "药学专业知识（一）" },
    { id: "western-2", title: "药学专业知识（二）" },
    { id: "western-3", title: "药学综合知识与技能" },
  ],
};

export default function DiagnosticPage() {
  const [selectedLicense, setSelectedLicense] = useState<
    (typeof LICENSE_OPTIONS)[number]["id"] | null
  >(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = useMemo(() => {
    if (!selectedLicense) return [];
    return SUBJECT_MAP[selectedLicense];
  }, [selectedLicense]);

  const handleLicenseSelect = (
    licenseId: (typeof LICENSE_OPTIONS)[number]["id"],
  ) => {
    setSelectedLicense(licenseId);
    setSelectedSubject(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-12 text-gray-50 sm:px-8 lg:py-20">
        {/* Section 1: Title */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/60 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-blue-500/10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            AI Diagnostic Setup
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white">
            Let’s customize your exam diagnostic
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            AI 诊断设置 · 先告诉我你考什么，我来帮你定位弱点
          </p>
        </section>

        {/* Section 2: License selection */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Step 1
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Which license are you preparing for?
          </h2>
          <p className="mt-1 text-lg text-blue-100">你正在备考哪一个证书？</p>
          <p className="mt-4 text-sm text-blue-200">
            ⚠️ 这是第一道筛选门槛，一次只能选一个，选完才能进入下一步。
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LICENSE_OPTIONS.map((license) => {
              const isActive = license.id === selectedLicense;
              return (
                <button
                  key={license.id}
                  type="button"
                  onClick={() => handleLicenseSelect(license.id)}
                  className={`flex h-full flex-col rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isActive
                      ? "border-blue-400 bg-blue-950/60 text-white"
                      : "border-white/10 bg-white/5 text-blue-100 hover:border-white/30"
                  }`}
                >
                  <span className="text-base font-semibold text-white">
                    {license.title}
                  </span>
                  <span className="mt-1 text-sm text-blue-200">
                    {license.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Subject selection */}
        {selectedLicense && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Step 2
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Which subject do you want to diagnose first?
            </h2>
            <p className="mt-1 text-lg text-blue-100">请选择你要诊断的科目</p>
            <div className="mt-6 space-y-3">
              {subjects.map((subject) => {
                const isActive = subject.id === selectedSubject;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left text-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      isActive
                        ? "border-blue-400 bg-blue-950/60 text-white"
                        : "border-white/10 bg-white/5 text-blue-100 hover:border-white/30"
                    }`}
                  >
                    {subject.title}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-blue-200">
              You can diagnose one subject at a time · 一次诊断一科，更精准
            </p>
          </section>
        )}

        {/* Section 4: CTA */}
        {selectedSubject && (
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 to-blue-400 p-6 text-center text-white shadow-2xl shadow-blue-500/30">
            <h2 className="text-2xl font-semibold">Start Diagnostic Test</h2>
            <p className="mt-2 text-lg">开始诊断测试</p>
            <Link
              href={`/diagnostic/questions?license=${selectedLicense}&subject=${selectedSubject}`}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 text-lg font-semibold text-blue-600 transition hover:translate-y-0.5 hover:bg-slate-100"
            >
              Start Diagnostic Test
            </Link>
            <p className="mt-4 text-sm text-white/80">
              Takes about 3–5 minutes · 用时约 3–5 分钟
            </p>
            <p className="text-sm text-white/80">
              No score, only analysis · 不打分，只分析
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
