"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  MessageCircle,
  ThumbsUp,
  Eye,
  TrendingUp,
  Award,
  Users,
  Clock,
  Star,
  Send,
  Plus,
  Filter,
  Search,
  PenSquare,
  CheckCircle,
  Heart,
} from "lucide-react";

// 内容类型
const CONTENT_TYPES = [
  { id: "all", name: "全部", icon: BookOpen },
  { id: "note", name: "学习笔记", icon: PenSquare },
  { id: "experience", name: "通关经验", icon: Award },
  { id: "discussion", name: "问题讨论", icon: MessageCircle },
  { id: "tip", name: "备考技巧", icon: TrendingUp },
];

// 考试类型
const EXAM_TYPES = [
  { id: "all", name: "全部考试" },
  { id: "pharmacist", name: "执业药师" },
  { id: "nurse", name: "护士/护师" },
  { id: "tcm-doctor", name: "中医执业医师" },
];

// 排序选项
const SORT_OPTIONS = [
  { id: "hot", name: "最热" },
  { id: "latest", name: "最新" },
  { id: "likes", name: "最多赞" },
];

interface UserContent {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  contentType: string;
  title: string;
  content: string;
  tags: string[];
  examType: string;
  subject?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: string;
  hasPassedExam?: boolean;
}

export default function CommunityPage() {
  const [contents, setContents] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("hot");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCommunityContents();
  }, [selectedType, selectedExamType, selectedSort]);

  const fetchCommunityContents = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      // const response = await fetch(`/api/community?type=${selectedType}&examType=${selectedExamType}&sort=${selectedSort}`);
      // const data = await response.json();

      // 模拟数据
      const mockData: UserContent[] = [
        {
          id: "1",
          userId: "u1",
          userName: "医考必过",
          contentType: "experience",
          title: "零基础一次通过执业药师，我的备考经验分享",
          content:
            "大家好！我是一名零基础考生，今年一次性通过了执业药师考试，想和大家分享一下我的备考经验...",
          tags: ["零基础", "通关经验", "备考计划"],
          examType: "执业药师",
          viewCount: 12850,
          likeCount: 2340,
          commentCount: 186,
          isPinned: true,
          isFeatured: true,
          createdAt: "2024-10-20",
          hasPassedExam: true,
        },
        {
          id: "2",
          userId: "u2",
          userName: "护士小姐姐",
          contentType: "note",
          title: "护理学基础知识点总结（超详细）",
          content:
            "整理了三个月的笔记，覆盖所有重点章节，希望对大家有帮助。包括：基础护理技术、内科护理...",
          tags: ["知识点总结", "笔记分享", "护理学基础"],
          examType: "护士资格",
          subject: "基础护理学",
          viewCount: 8960,
          likeCount: 1520,
          commentCount: 94,
          isPinned: false,
          isFeatured: true,
          createdAt: "2024-10-18",
        },
        {
          id: "3",
          userId: "u3",
          userName: "中医学霸",
          contentType: "tip",
          title: "中药功效记忆口诀，再也不用死记硬背！",
          content:
            "分享一些我自己总结的中药功效记忆口诀，帮助大家更轻松地记忆中药知识...",
          tags: ["记忆技巧", "中药学", "口诀"],
          examType: "中医执业医师",
          subject: "中药学",
          viewCount: 15420,
          likeCount: 3280,
          commentCount: 245,
          isPinned: false,
          isFeatured: false,
          createdAt: "2024-10-15",
        },
        {
          id: "4",
          userId: "u4",
          userName: "药学老王",
          contentType: "discussion",
          title: "求助：药物化学这一块怎么学才能快速提高？",
          content:
            "药物化学一直是我的弱项，看了很多资料还是云里雾里，请教一下大家有什么好的学习方法吗？",
          tags: ["求助", "药物化学", "学习方法"],
          examType: "执业药师",
          subject: "药学专业知识一",
          viewCount: 3560,
          likeCount: 420,
          commentCount: 68,
          isPinned: false,
          isFeatured: false,
          createdAt: "2024-10-19",
        },
        {
          id: "5",
          userId: "u5",
          userName: "通关达人",
          contentType: "experience",
          title: "工作党如何平衡工作和备考？我的时间管理心得",
          content:
            "作为一名全职工作者，如何在有限的时间内高效备考是个大问题。分享一下我的时间管理经验...",
          tags: ["时间管理", "在职备考", "高效学习"],
          examType: "执业药师",
          viewCount: 6780,
          likeCount: 1240,
          commentCount: 132,
          isPinned: false,
          isFeatured: true,
          createdAt: "2024-10-16",
          hasPassedExam: true,
        },
        {
          id: "6",
          userId: "u6",
          userName: "医学小白",
          contentType: "note",
          title: "临床常用药物分类及作用机制总结",
          content:
            "整理了临床常用药物的分类和作用机制，方便大家系统学习和记忆...",
          tags: ["药物分类", "作用机制", "临床用药"],
          examType: "临床执业医师",
          viewCount: 4520,
          likeCount: 680,
          commentCount: 45,
          isPinned: false,
          isFeatured: false,
          createdAt: "2024-10-14",
        },
      ];

      setContents(mockData);
    } catch (error) {
      console.error("获取社区内容失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || content.contentType === selectedType;
    const matchesExamType =
      selectedExamType === "all" || content.examType === selectedExamType;
    return matchesSearch && matchesType && matchesExamType;
  });

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "note":
        return PenSquare;
      case "experience":
        return Award;
      case "discussion":
        return MessageCircle;
      case "tip":
        return TrendingUp;
      default:
        return BookOpen;
    }
  };

  const getContentTypeName = (type: string) => {
    const found = CONTENT_TYPES.find((t) => t.id === type);
    return found ? found.name : type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">医药考试通</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/recommend" className="text-gray-600 hover:text-blue-500 transition">
              AI推荐
            </Link>
            <Link href="/institutions" className="text-gray-600 hover:text-blue-500 transition">
              机构对比
            </Link>
            <Link href="/materials" className="text-gray-600 hover:text-blue-500 transition">
              资料测评
            </Link>
            <Link href="/predictions" className="text-gray-600 hover:text-blue-500 transition">
              押题专区
            </Link>
            <Link href="/community" className="text-blue-500 font-medium">
              学员社区
            </Link>
          </div>
          <Link href="/" className="text-gray-600 hover:text-blue-500 transition">
            返回首页
          </Link>
        </div>
      </nav>

      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              <span>学员互助社区</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              一起学习，共同进步
            </h1>
            <p className="text-xl text-blue-100">
              分享笔记 · 交流经验 · 互相鼓励
            </p>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "社区成员", value: "5万+", icon: Users },
              { label: "精华内容", value: "2000+", icon: Award },
              { label: "每日活跃", value: "8000+", icon: TrendingUp },
              { label: "通关学员", value: "3万+", icon: CheckCircle },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧：内容列表 */}
          <div className="flex-1">
            {/* 内容类型标签 */}
            <div className="flex flex-wrap gap-3 mb-6">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition ${
                    selectedType === type.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>

            {/* 搜索和筛选 */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">考试类型</label>
                    <div className="flex flex-wrap gap-2">
                      {EXAM_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedExamType(type.id)}
                          className={`px-3 py-1 text-sm rounded-lg border-2 transition ${
                            selectedExamType === type.id
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-200"
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">排序</label>
                    <div className="flex gap-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedSort(option.id)}
                          className={`px-3 py-1 text-sm rounded-lg border-2 transition ${
                            selectedSort === option.id
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-200"
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 内容列表 */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContents.map((content) => {
                  const ContentIcon = getContentTypeIcon(content.contentType);
                  return (
                    <div
                      key={content.id}
                      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-2 ${
                        content.isPinned
                          ? "border-yellow-400"
                          : "border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      {/* 头部 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {content.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{content.userName}</span>
                              {content.hasPassedExam && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-0.5" />
                                  已通过
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {content.createdAt}
                            </div>
                          </div>
                        </div>

                        {(content.isPinned || content.isFeatured) && (
                          <div className="flex gap-1">
                            {content.isPinned && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                置顶
                              </span>
                            )}
                            {content.isFeatured && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                精华
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 内容 */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2 flex items-center">
                          <ContentIcon className="w-5 h-5 mr-2 text-blue-500" />
                          {content.title}
                        </h3>
                        <p className="text-gray-700 line-clamp-2">{content.content}</p>
                      </div>

                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                          {content.examType}
                        </span>
                        {content.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* 互动数据 */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition">
                            <Heart className="w-4 h-4" />
                            <span>{content.likeCount}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition">
                            <MessageCircle className="w-4 h-4" />
                            <span>{content.commentCount}</span>
                          </button>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{content.viewCount}</span>
                          </span>
                        </div>
                        <button className="text-blue-500 hover:underline">
                          查看详情 →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 空状态 */}
            {!loading && filteredContents.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">暂无相关内容</h3>
                <p className="text-gray-600">尝试其他筛选条件或成为第一个发帖的人</p>
              </div>
            )}
          </div>

          {/* 右侧：侧边栏 */}
          <div className="lg:w-80 space-y-6">
            {/* 发布按钮 */}
            <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>发布内容</span>
            </button>

            {/* 热门话题 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                热门话题
              </h3>
              <div className="space-y-3">
                {[
                  { tag: "零基础备考", count: "2.3万" },
                  { tag: "药理学记忆", count: "1.8万" },
                  { tag: "考前冲刺", count: "1.5万" },
                  { tag: "时间管理", count: "1.2万" },
                  { tag: "错题总结", count: "9800" },
                ].map((topic, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-between group"
                  >
                    <span className="group-hover:text-blue-500">#{topic.tag}</span>
                    <span className="text-sm text-gray-500">{topic.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 优秀学员 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                本月优秀学员
              </h3>
              <div className="space-y-3">
                {[
                  { name: "医考必过", posts: 28, likes: 3420 },
                  { name: "护士小姐姐", posts: 24, likes: 2850 },
                  { name: "中医学霸", posts: 19, likes: 2340 },
                ].map((user, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">
                        {user.posts}篇 · {user.likes}赞
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 社区公告 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="font-bold mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-500" />
                社区公告
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                欢迎加入医药考试通学员社区！在这里你可以分享学习笔记、交流备考经验、结识志同道合的伙伴。让我们一起努力，共同进步！
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

