"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star, 
  Users, 
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  BarChart3,
  DollarSign,
  Trophy,
  ThumbsUp
} from "lucide-react";

// 筛选选项
const EXAM_TYPES = [
  { id: "all", name: "全部考试" },
  { id: "pharmacist", name: "执业药师" },
  { id: "nurse", name: "护士/护师" },
  { id: "tcm-doctor", name: "中医执业医师" },
  { id: "clinical-doctor", name: "临床执业医师" },
];

const SORT_OPTIONS = [
  { id: "rating", name: "综合评分" },
  { id: "hit-rate", name: "命中率" },
  { id: "students", name: "学员数量" },
  { id: "price", name: "性价比" },
];

interface Institution {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  overallRating: number;
  priceRating: number;
  hitRateRating: number;
  serviceRating: number;
  reviewCount: number;
  studentCount: number;
  courseCount: number;
  tags: string[];
  isPremium: boolean;
  isVerified: boolean;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  // 获取机构数据
  useEffect(() => {
    fetchInstitutions();
  }, [selectedExamType, selectedSort]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      // const response = await fetch(`/api/institutions?examType=${selectedExamType}&sort=${selectedSort}`);
      // const data = await response.json();
      
      // 模拟数据
      const mockData: Institution[] = [
        {
          id: "1",
          name: "医学教育网",
          description: "国内领先的医学远程教育基地，专注医药卫生类考试培训",
          overallRating: 4.8,
          priceRating: 4.5,
          hitRateRating: 4.9,
          serviceRating: 4.7,
          reviewCount: 3280,
          studentCount: 120000,
          courseCount: 156,
          tags: ["名师授课", "高通过率", "全程督学", "24小时答疑"],
          isPremium: true,
          isVerified: true,
        },
        {
          id: "2",
          name: "环球网校",
          description: "职业教育行业知名品牌，医药类考试培训经验丰富",
          overallRating: 4.6,
          priceRating: 4.8,
          hitRateRating: 4.5,
          serviceRating: 4.6,
          reviewCount: 2150,
          studentCount: 85000,
          courseCount: 128,
          tags: ["性价比高", "课程丰富", "服务完善"],
          isPremium: true,
          isVerified: true,
        },
        {
          id: "3",
          name: "中公医考",
          description: "中公教育旗下医考培训品牌，线上线下结合教学",
          overallRating: 4.5,
          priceRating: 4.3,
          hitRateRating: 4.6,
          serviceRating: 4.5,
          reviewCount: 1890,
          studentCount: 65000,
          courseCount: 98,
          tags: ["面授+网课", "小班教学", "专业师资"],
          isPremium: false,
          isVerified: true,
        },
        {
          id: "4",
          name: "华图医考",
          description: "华图教育医学考试培训部门，强大的教研团队",
          overallRating: 4.4,
          priceRating: 4.2,
          hitRateRating: 4.4,
          serviceRating: 4.3,
          reviewCount: 1560,
          studentCount: 52000,
          courseCount: 82,
          tags: ["教研实力强", "押题准确", "学习规划"],
          isPremium: false,
          isVerified: true,
        },
        {
          id: "5",
          name: "润德教育",
          description: "专注执业药师培训，通过率业内领先",
          overallRating: 4.7,
          priceRating: 4.4,
          hitRateRating: 4.8,
          serviceRating: 4.6,
          reviewCount: 2420,
          studentCount: 78000,
          courseCount: 64,
          tags: ["执业药师专家", "高通过率", "针对性强"],
          isPremium: true,
          isVerified: true,
        },
        {
          id: "6",
          name: "文都医考",
          description: "文都教育旗下医学考试培训品牌，资料丰富",
          overallRating: 4.3,
          priceRating: 4.6,
          hitRateRating: 4.2,
          serviceRating: 4.4,
          reviewCount: 1280,
          studentCount: 45000,
          courseCount: 76,
          tags: ["资料全面", "价格实惠", "直播互动"],
          isPremium: false,
          isVerified: true,
        },
      ];

      setInstitutions(mockData);
    } catch (error) {
      console.error("获取机构数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选和搜索
  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
            <Link href="/institutions" className="text-blue-500 font-medium">
              机构对比
            </Link>
            <Link href="/materials" className="text-gray-600 hover:text-blue-500 transition">
              资料测评
            </Link>
            <Link href="/predictions" className="text-gray-600 hover:text-blue-500 transition">
              押题专区
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-blue-500 transition">
              学员社区
            </Link>
          </div>
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-500 transition"
          >
            返回首页
          </Link>
        </div>
      </nav>

      {/* 页面标题和统计 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              <span>培训机构数据对比</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              医考培训机构全面评测
            </h1>
            <p className="text-xl text-blue-100">
              中立客观的机构对比数据，帮助您做出明智选择
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "入驻机构", value: institutions.length, icon: Award },
              { label: "真实评价", value: "2万+", icon: Star },
              { label: "覆盖学员", value: "50万+", icon: Users },
              { label: "数据更新", value: "实时", icon: TrendingUp },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {/* 搜索框 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索机构名称或关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition flex items-center justify-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>筛选</span>
            </button>
          </div>

          {/* 筛选选项 */}
          {showFilters && (
            <div className="border-t pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">考试类型</label>
                <div className="flex flex-wrap gap-2">
                  {EXAM_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedExamType(type.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedExamType === type.id
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">排序方式</label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedSort(option.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedSort === option.id
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:border-blue-300"
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

        {/* 机构列表 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredInstitutions.map((inst, index) => (
              <div
                key={inst.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border-2 border-gray-100 hover:border-blue-200 p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 左侧：机构信息 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-2xl font-bold">{inst.name}</h3>
                            {inst.isVerified && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                            {inst.isPremium && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                金牌机构
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{inst.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* 评分数据 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">
                            {inst.overallRating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">综合评分</div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Trophy className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">
                            {inst.hitRateRating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">命中率</div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">
                            {inst.priceRating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">性价比</div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <ThumbsUp className="w-4 h-4 text-purple-500 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">
                            {inst.serviceRating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">服务质量</div>
                      </div>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {(inst.studentCount / 10000).toFixed(1)}万学员
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {inst.courseCount}门课程
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {inst.reviewCount}条评价
                      </span>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2">
                      {inst.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 右侧：操作按钮 */}
                  <div className="flex flex-col justify-between lg:w-48">
                    <div className="space-y-3">
                      <Link
                        href={`/institutions/${inst.id}`}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-2"
                      >
                        <span>查看详情</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button className="w-full py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition">
                        对比机构
                      </button>
                      <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                        查看评价
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && filteredInstitutions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">未找到相关机构</h3>
            <p className="text-gray-600">请尝试其他搜索条件</p>
          </div>
        )}
      </div>

      {/* CTA区域 */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            不确定选哪个？让AI帮你推荐
          </h2>
          <p className="text-gray-600 mb-8">
            根据您的需求和预算，智能匹配最适合的培训方案
          </p>
          <Link
            href="/recommend"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition space-x-2"
          >
            <span>免费获取AI推荐</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

