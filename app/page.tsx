"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Target,
  Lightbulb,
  Brain,
  LineChart,
  CheckCircle2,
  BookOpen,
  Compass
} from "lucide-react";

const primaryCtaHref = "/diagnostic";

function CTAButton({ label = "开始 AI 诊断（免费）", secondary = false }: { label?: string; secondary?: boolean }) {
  const base = "inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold transition-all";
  const pointer = (
    <span className="text-xl" aria-hidden>
      👉
    </span>
  );
  if (secondary) {
    return (
      <Link
        href={primaryCtaHref}
        className={`${base} border border-blue-200 text-blue-700 bg-white hover:border-blue-400 hover:text-blue-900`}
      >
        {pointer}
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={primaryCtaHref}
      className={`${base} bg-gradient-to-r from-blue-600 to-purple-500 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02]`}
    >
      {pointer}
      {label}
    </Link>
  );
}

const stepCards = [
  {
    title: "第 1 步",
    subtitle: "完成一小套精选题目",
    desc: "回答 20 道诊断题，3-5 分钟内轻松完成。",
    icon: Target,
  },
  {
    title: "第 2 步",
    subtitle: "AI 分析你的知识盲区",
    desc: "算法即时拆解易错点、遗忘点与薄弱章节。",
    icon: Brain,
  },
  {
    title: "第 3 步",
    subtitle: "生成专属学习路线",
    desc: "告诉你先学什么、跳过什么，学习顺序一次排好。",
    icon: Lightbulb,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-900">
      {/* First Screen */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-100/80 via-white to-purple-100/60 z-0" />
        <div className="container relative z-10 mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              只干这一件事：让你点下“开始诊断”
            </span>
            <p className="mt-6 text-lg font-semibold text-gray-700">别再盲目刷题了。</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">
              3-5 分钟 AI 诊断，直接找出你最容易丢分的考点
            </h1>
            <p className="mt-6 text-lg text-gray-600">不再猜下一步学什么，AI 直接告诉你薄弱点和补救顺序。</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <CTAButton />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Link
                href="/diagnostic"
                className="rounded-3xl border border-blue-100 bg-white/90 px-6 py-5 text-lg font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:border-blue-300"
              >
                <p>开始诊断</p>
                <p className="text-sm text-gray-500">知识图谱帮你找到薄弱考点</p>
              </Link>
              <Link
                href="/diagnostic"
                className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-purple-500 px-6 py-5 text-lg font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                <p>打开知识图谱</p>
                <p className="text-sm text-white/80">用可视化地图看懂全部考点关系</p>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">无需注册 · 用时不到 5 分钟</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["定位薄弱章节", "解释错因", "立刻给出学习顺序"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white/90 p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">今日进度</p>
                <p className="mt-1 text-4xl font-bold text-blue-600">78%</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">诊断完成用时</p>
                <p className="mt-1 text-2xl font-semibold text-gray-800">3 分 42 秒</p>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {["药剂学 · 制剂稳定性 — 紧急补救", "药理学 · 心血管药物 — 重点巩固", "药物化学 · 抗生素 — 已掌握"].map((item, idx) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item}</p>
                    <p className="text-xs text-gray-500">AI 给出的下一步动作</p>
                  </div>
                  <CheckCircle2 className={`h-6 w-6 ${idx === 0 ? "text-red-400" : idx === 1 ? "text-yellow-400" : "text-green-500"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Diagnostic First */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-500">这一屏是你和普通题库的分水岭</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">大多数人考不过，不是因为不努力，而是学错了重点</h2>
            <p className="mt-6 text-lg text-gray-600">
              传统题海战术只会磨掉时间；AI 诊断直接告诉你哪里不会、为什么不会，先把方向掰正。
            </p>
            <p className="mt-4 text-base text-gray-500">你不缺努力，你缺的是正确顺序。</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-8">
              <p className="text-sm font-semibold text-gray-500">传统备考方式</p>
              <h3 className="mt-3 text-2xl font-bold text-gray-800">刷题靠感觉，时间被大量浪费</h3>
              <ul className="mt-6 space-y-3 text-gray-600">
                <li>· 同一知识点反复做，真正短板一直没碰到</li>
                <li>· 只知道对错，不知道错在概念还是方法</li>
                <li>· 没有学习顺序，越学越焦虑</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-8 shadow-lg shadow-blue-100">
              <p className="text-sm font-semibold text-blue-600">一考必过 AI 诊断</p>
              <h3 className="mt-3 text-2xl font-bold text-blue-900">直接告诉你：哪里不会、为什么不会</h3>
              <ul className="mt-6 space-y-3 text-blue-900/80">
                <li>· 根据答题轨迹定位概念盲点和解题盲点</li>
                <li>· 给出错因解释与学习顺序，避免重复踩坑</li>
                <li>· 生成学习清单，提醒哪些内容可以先跳过</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-xl font-semibold text-gray-800">
            你不缺努力，你缺的是正确顺序。
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-blue-900 to-purple-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.3em] text-blue-200">这一屏就是为了降低心理门槛</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">AI 诊断是怎么进行的？</h2>
            <p className="mt-6 text-lg text-blue-100">不到 5 分钟，完成后立刻拿到你的薄弱清单与补救顺序。</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {stepCards.map((step) => (
              <div key={step.title} className="rounded-3xl bg-white/10 p-6 text-left backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                  <step.icon className="h-5 w-5" />
                  {step.title}
                </div>
                <h3 className="mt-4 text-2xl font-semibold">{step.subtitle}</h3>
                <p className="mt-4 text-sm text-blue-100/90">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <CTAButton label="开始我的诊断" />
          </div>
          <p className="mt-6 text-center text-sm text-blue-100">少学废内容，多拿关键分。</p>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.3em] text-purple-500">价值确认</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">完成诊断后，你将清楚知道：</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {["哪些章节你已经掌握", "哪些考点是高频失分陷阱", "下一步学什么，哪些可以直接跳过"].map((text) => (
              <div key={text} className="rounded-3xl border border-gray-100 bg-gray-50/70 p-6 text-lg font-medium text-gray-700">
                {text}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center text-lg text-gray-600">不靠猜 · 不焦虑 · 只做对的事</div>
        </div>
      </section>

      {/* Bridge Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-[0.3em] text-blue-500">诊断 → 学习 / 练习的正确顺序</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">学习和做题，应该发生在诊断之后</h2>
            <p className="mt-6 text-lg text-gray-600">先诊断再学习/练习，才是真正高效的备考方式。</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-blue-600">
                <BookOpen className="h-6 w-6" />
                <h3 className="text-2xl font-semibold">学习：只学你不会的</h3>
              </div>
              <p className="mt-4 text-gray-600">诊断结果自动生成学习清单，直接定位薄弱章节与考点。</p>
            </div>
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-purple-600">
                <Compass className="h-6 w-6" />
                <h3 className="text-2xl font-semibold">做题：只练真正会考的</h3>
              </div>
              <p className="mt-4 text-gray-600">智能练习只推送高概率题型，保证每一道题都值得做。</p>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <CTAButton label="立即开始 AI 诊断" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 text-gray-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">YiKaoBiGuo · 更聪明的备考方式</p>
          <h3 className="mt-4 text-2xl font-semibold text-white">AI 让备考不再盲目</h3>
          <p className="mt-6 text-gray-400">基于知识图谱的 AI 智能学习系统 · 数据安全加密 · 7×24 可用</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CTAButton label="开始 AI 诊断" />
          </div>
          <p className="mt-10 text-sm text-gray-500">© 2024 医考必过 · 数据永久保存 · 客服微信：yikaobiguo</p>
        </div>
      </footer>
    </div>
  );
}
