"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const LICENSE_OPTIONS = [
  {
    id: "tcm",
    title: "执业药师（中药）",
    subtitle: "适合主攻中药方向",
  },
  {
    id: "western",
    title: "执业药师（西药）",
    subtitle: "适合主攻药学方向",
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-900">
      <div className="container mx-auto flex min-h-screen flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
        {/* Section 1 */}
        <section className="mx-auto w-full max-w-3xl rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-xl">
          <p className="text-sm font-semibold tracking-[0.3em] text-blue-500">AI 诊断设置</p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">只需一步配置，马上定位薄弱点</h1>
          <p className="mt-4 text-lg text-gray-600">告诉我你的考试方向与科目，诊断才更精准。</p>
          <p className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            ⏱ 用时约 3–5 分钟 ｜ 不打分，仅分析
          </p>
        </section>

        {/* Section 2 */}
        <section className="mx-auto w-full max-w-3xl space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
          <p className="text-sm font-semibold text-blue-600">第 1 步</p>
          <h2 className="text-2xl font-bold text-gray-900">你正在备考哪个证书？</h2>
          <p className="text-gray-600">请选择当前最主要的备考方向，选完再进入下一步。</p>
          <p className="text-sm text-gray-500">⚠ 一次只选一个</p>
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
                      ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200"
                  }`}
                >
                  <span className="text-lg font-semibold">{license.title}</span>
                  <span className="mt-2 text-sm text-gray-500">{license.subtitle}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3 */}
        {selectedLicense && (
          <section className="mx-auto w-full max-w-3xl space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
            <p className="text-sm font-semibold text-blue-600">第 2 步</p>
            <h2 className="text-2xl font-bold text-gray-900">你要先诊断哪一科？</h2>
            <p className="text-gray-600">一次只诊断一科，结果更准确。</p>
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
                        ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                        : "border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200"
                    }`}
                  >
                    {subject.title}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-500">一次诊断一科，系统会自动记录你的选择。</p>
          </section>
        )}

        {/* Section 4 */}
        {selectedSubject && (
          <section className="mx-auto w-full max-w-3xl rounded-3xl bg-gradient-to-r from-blue-600 to-purple-500 p-6 text-center text-white shadow-2xl">
            <h2 className="text-2xl font-semibold">配置完成，开始诊断</h2>
            <p className="mt-2 text-base text-white/80">⏱ 约 3–5 分钟完成 ｜ 随时可退出</p>
            <Link
              href={`/diagnostic/questions?license=${selectedLicense}&subject=${selectedSubject}`}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 text-lg font-semibold text-blue-600 transition hover:translate-y-0.5 hover:bg-slate-100"
            >
              开始诊断
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
