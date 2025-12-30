 "use client";

import Link from "next/link";
import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  BookOpen,
  Sparkles,
  FileText,
  Menu,
  X,
  ChevronDown,
  Target,
  BarChart3,
  BookMarked,
  History,
  Layers,
  Zap,
  Home,
} from "lucide-react";
import { getSupabaseClient, getCurrentUser } from "@/lib/auth";
import { migrateLocalProgressToServer } from "@/lib/learningProgress";

interface NavDropdownItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: NavDropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function NavDropdown({ label, icon, items, isOpen, onToggle, onClose }: NavDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition font-medium py-2"
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-start space-x-3 px-4 py-3 hover:bg-blue-50 transition"
            >
              <div className="text-blue-500 mt-0.5">{item.icon}</div>
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                {item.description && (
                  <div className="text-sm text-gray-500">{item.description}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [magicLinkStatus, setMagicLinkStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [magicLinkMessage, setMagicLinkMessage] = useState<string | null>(null);
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const lastSyncedUserId = useRef<string | null>(null);

  const diagnosticItems: NavDropdownItem[] = [
    {
      href: "/exams",
      label: "考试诊断概览",
      icon: <Target className="w-5 h-5" />,
      description: "了解 AI 诊断及可选考试",
    },
    {
      href: "/exams/start",
      label: "开始诊断",
      icon: <Sparkles className="w-5 h-5" />,
      description: "AI 出题，20 题定位薄弱点",
    },
    {
      href: "/exams/result",
      label: "查看诊断报告",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "薄弱章节与知识点建议",
    },
  ];

  const learningItems: NavDropdownItem[] = [
    {
      href: "/knowledge",
      label: "知识图谱",
      icon: <BookMarked className="w-5 h-5" />,
      description: "章节-知识点全景视图",
    },
    {
      href: "/knowledge#chapter-roadmap",
      label: "章节导航",
      icon: <Layers className="w-5 h-5" />,
      description: "按教材结构逐章学习",
    },
    {
      href: "/knowledge#weak-points",
      label: "薄弱点复盘",
      icon: <History className="w-5 h-5" />,
      description: "来自诊断报告的弱项列表",
    },
  ];

  const practiceItems: NavDropdownItem[] = [
    {
      href: "/practice",
      label: "练习中心",
      icon: <FileText className="w-5 h-5" />,
      description: "统一查看练习模式与进度",
    },
    {
      href: "/practice/by-point",
      label: "知识点练习",
      icon: <Target className="w-5 h-5" />,
      description: "针对薄弱知识点专项刷题",
    },
    {
      href: "/practice/by-chapter",
      label: "章节练习",
      icon: <Layers className="w-5 h-5" />,
      description: "跟随教材顺序逐章练习",
    },
    {
      href: "/practice/mock",
      label: "模拟考试",
      icon: <Zap className="w-5 h-5" />,
      description: "限时全真模拟，检验掌握度",
    },
    {
      href: "/practice/history",
      label: "历年真题",
      icon: <History className="w-5 h-5" />,
      description: "快速进入 2022-2024 真题库",
    },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((user) => {
      if (mounted) setUser(user ?? null);
    });
    const { data: listener } = getSupabaseClient().auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      lastSyncedUserId.current = null;
      setSyncNotice(null);
      return;
    }
    if (lastSyncedUserId.current === user.id) return;
    lastSyncedUserId.current = user.id;

    migrateLocalProgressToServer()
      .then(({ syncedCount }) => {
        if (syncedCount && syncedCount > 0) {
          setSyncNotice(`已为你同步 ${syncedCount} 个考点`);
        }
      })
      .catch((error) => {
        console.error("同步本地进度失败", error);
      });
  }, [user]);

  useEffect(() => {
    if (!syncNotice) return;
    const timer = window.setTimeout(() => setSyncNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [syncNotice]);

  useEffect(() => {
    const navSummary = {
      primaryDesktop: ["首页", "诊断", "学习", "做题"],
      dropdownCounts: {
        diagnostic: diagnosticItems.length,
        learning: learningItems.length,
        practice: practiceItems.length,
      },
    };
    fetch("/api/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "components/Navbar.tsx:navSummary",
        message: "Navbar mounted with new IA nav items",
        data: navSummary,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [diagnosticItems.length, learningItems.length, practiceItems.length]);

  const handleMagicLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginEmail.trim()) {
      setMagicLinkMessage("请输入有效邮箱");
      setMagicLinkStatus("error");
      return;
    }
    setMagicLinkStatus("sending");
    setMagicLinkMessage(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setMagicLinkStatus("sent");
        setMagicLinkMessage("登录链接已发送，请查看邮箱");
      } else {
        setMagicLinkStatus("error");
        setMagicLinkMessage(result.error || "发送失败");
      }
    } catch (error) {
      console.error("发送 Magic Link 失败", error);
      setMagicLinkStatus("error");
      setMagicLinkMessage("网络异常，请稍后重试");
    }
  };

  const handleSignOut = async () => {
    await getSupabaseClient().auth.signOut();
    setUser(null);
    setMagicLinkMessage(null);
    setMagicLinkStatus("idle");
  };
  }, [diagnosticItems.length, learningItems.length, practiceItems.length]);

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-gray-900">医药考试通</span>
          </Link>

          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition font-medium"
            >
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>

            <NavDropdown
              label="诊断"
              icon={<Target className="w-4 h-4" />}
              items={diagnosticItems}
              isOpen={openDropdown === "diagnostic"}
              onToggle={() => toggleDropdown("diagnostic")}
              onClose={closeDropdown}
            />

            <NavDropdown
              label="学习"
              icon={<BookOpen className="w-4 h-4" />}
              items={learningItems}
              isOpen={openDropdown === "learning"}
              onToggle={() => toggleDropdown("learning")}
              onClose={closeDropdown}
            />

            <NavDropdown
              label="做题"
              icon={<FileText className="w-4 h-4" />}
              items={practiceItems}
              isOpen={openDropdown === "practice"}
              onToggle={() => toggleDropdown("practice")}
              onClose={closeDropdown}
            />
          </div>

          {/* 右侧按钮 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/diagnostic"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              开始诊断
            </Link>
            {user ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">{user.email || "已登录"}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowLoginForm((prev) => !prev)}
                  className="px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold transition hover:bg-blue-100"
                >
                  同步进度
                </button>
                {showLoginForm && (
                  <form
                    onSubmit={handleMagicLinkSubmit}
                    className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-3 shadow-lg space-y-2 z-50"
                  >
                    <label className="text-xs font-medium text-gray-500">
                      输入邮箱，发送 Magic Link
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                      {magicLinkStatus === "sending" ? "发送中..." : "发送链接"}
                    </button>
                    {magicLinkMessage && (
                      <p
                        className={`text-xs ${
                          magicLinkStatus === "error" ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {magicLinkMessage}
                      </p>
                    )}
                  </form>
                )}
                {syncNotice && (
                  <p className="mt-2 text-xs text-emerald-600">{syncNotice}</p>
                )}
              </div>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-blue-500"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>


        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5 text-blue-500" />
                <span className="font-medium">首页</span>
              </Link>

              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                诊断
              </div>
              {diagnosticItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-blue-500">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}

              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">
                学习
              </div>
              {learningItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-blue-500">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}

              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">
                做题
              </div>
              {practiceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-blue-500">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}

              <div className="px-4 pt-4 mt-4 border-t">
                <Link
                  href="/diagnostic"
                  className="block w-full py-3 text-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  开始诊断
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
