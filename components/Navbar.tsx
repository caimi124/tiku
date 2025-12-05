"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  FileText,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Target,
  BarChart3,
  BookMarked,
  Brain,
  History,
  Layers,
  Zap,
} from "lucide-react";

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

  const learningCenterItems: NavDropdownItem[] = [
    {
      href: "/dashboard",
      label: "我的仪表盘",
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: "查看学习进度和统计",
    },
    {
      href: "/dashboard#recommendations",
      label: "学习计划",
      icon: <Target className="w-5 h-5" />,
      description: "个性化学习推荐",
    },
    {
      href: "/dashboard#weak-points",
      label: "薄弱点分析",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "识别需要加强的知识点",
    },
    {
      href: "/dashboard#heatmap",
      label: "学习报告",
      icon: <History className="w-5 h-5" />,
      description: "查看学习热力图和连续天数",
    },
  ];

  const practiceItems: NavDropdownItem[] = [
    {
      href: "/practice/history?exam=pharmacist",
      label: "历年真题",
      icon: <History className="w-5 h-5" />,
      description: "2022-2024年真题练习",
    },
    {
      href: "/practice/chapter",
      label: "章节练习",
      icon: <Layers className="w-5 h-5" />,
      description: "按章节系统学习",
    },
    {
      href: "/practice/weak",
      label: "薄弱专练",
      icon: <Target className="w-5 h-5" />,
      description: "针对薄弱点强化训练",
    },
    {
      href: "/practice/smart",
      label: "AI智能组卷",
      icon: <Zap className="w-5 h-5" />,
      description: "智能生成个性化试卷",
    },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

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
            {/* 学习中心下拉菜单 */}
            <NavDropdown
              label="学习中心"
              icon={<LayoutDashboard className="w-4 h-4" />}
              items={learningCenterItems}
              isOpen={openDropdown === "learning"}
              onToggle={() => toggleDropdown("learning")}
              onClose={closeDropdown}
            />

            {/* 知识图谱 */}
            <Link
              href="/knowledge"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition font-medium"
            >
              <BookMarked className="w-4 h-4" />
              <span>知识图谱</span>
            </Link>

            {/* 刷题练习下拉菜单 */}
            <NavDropdown
              label="刷题练习"
              icon={<FileText className="w-4 h-4" />}
              items={practiceItems}
              isOpen={openDropdown === "practice"}
              onToggle={() => toggleDropdown("practice")}
              onClose={closeDropdown}
            />

            {/* 模拟考试 */}
            <Link
              href="/exams"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition font-medium"
            >
              <Target className="w-4 h-4" />
              <span>模拟考试</span>
            </Link>

            {/* AI推荐 */}
            <Link
              href="/recommend"
              className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI推荐</span>
            </Link>

            {/* 社区 */}
            <Link
              href="/community"
              className="text-gray-600 hover:text-blue-500 transition"
            >
              社区
            </Link>
          </div>

          {/* 右侧按钮 */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-500 transition"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              免费注册
            </Link>
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
              {/* 学习中心 */}
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                学习中心
              </div>
              {learningCenterItems.map((item) => (
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

              {/* 知识图谱 */}
              <Link
                href="/knowledge"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookMarked className="w-5 h-5 text-blue-500" />
                <span className="font-medium">知识图谱</span>
              </Link>

              {/* 刷题练习 */}
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">
                刷题练习
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

              {/* 其他链接 */}
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mt-4">
                更多
              </div>
              <Link
                href="/exams"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-medium">模拟考试</span>
              </Link>
              <Link
                href="/recommend"
                className="flex items-center space-x-3 px-4 py-3 text-blue-500 hover:bg-blue-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">AI推荐</span>
              </Link>
              <Link
                href="/community"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Brain className="w-5 h-5 text-blue-500" />
                <span className="font-medium">学员社区</span>
              </Link>

              {/* 登录注册 */}
              <div className="flex flex-col space-y-2 px-4 pt-4 mt-4 border-t">
                <Link
                  href="/login"
                  className="py-2 text-center text-gray-700 hover:text-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  免费注册
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
