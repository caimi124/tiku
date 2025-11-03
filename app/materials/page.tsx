"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Download,
  TrendingUp,
  Award,
  Target,
  FileText,
  Video,
  BookMarked,
  ArrowRight,
  Eye,
  ShoppingCart,
} from "lucide-react";

// 资料类型
const MATERIAL_TYPES = [
  { id: "all", name: "全部资料", icon: BookOpen },
  { id: "pdf", name: "PDF讲义", icon: FileText },
  { id: "real-exam", name: "历年真题", icon: Target },
  { id: "prediction", name: "押题资料", icon: Award },
  { id: "video", name: "视频课程", icon: Video },
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
  { id: "hit-rate", name: "命中率" },
  { id: "rating", name: "评分" },
  { id: "downloads", name: "下载量" },
  { id: "latest", name: "最新" },
];

interface Material {
  id: string;
  name: string;
  type: string;
  examType: string;
  subject: string;
  year: number;
  description: string;
  price: number;
  hitRate: number;
  coverageRate: number;
  rating: number;
  downloadCount: number;
  reviewCount: number;
  pageCount?: number;
  institutionName?: string;
  isFeatured: boolean;
  isPremium: boolean;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("hit-rate");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [selectedType, selectedExamType, selectedSort]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      // const response = await fetch(`/api/materials?type=${selectedType}&examType=${selectedExamType}&sort=${selectedSort}`);
      // const data = await response.json();

      // 模拟数据
      const mockData: Material[] = [
        {
          id: "1",
          name: "2024执业药师核心考点精编",
          type: "PDF讲义",
          examType: "执业药师",
          subject: "药学综合",
          year: 2024,
          description: "涵盖所有高频考点，浓缩精华内容，适合冲刺复习",
          price: 0,
          hitRate: 88.5,
          coverageRate: 92.3,
          rating: 4.8,
          downloadCount: 15230,
          reviewCount: 486,
          pageCount: 256,
          institutionName: "医学教育网",
          isFeatured: true,
          isPremium: false,
        },
        {
          id: "2",
          name: "执业药师历年真题详解（2019-2023）",
          type: "真题集",
          examType: "执业药师",
          subject: "全科",
          year: 2023,
          description: "5年真题完整收录，每题配详细解析和考点标注",
          price: 98,
          hitRate: 95.2,
          coverageRate: 98.5,
          rating: 4.9,
          downloadCount: 12850,
          reviewCount: 623,
          pageCount: 428,
          institutionName: "环球网校",
          isFeatured: true,
          isPremium: true,
        },
        {
          id: "3",
          name: "2024护士资格考前押题包",
          type: "押题",
          examType: "护士资格",
          subject: "全科",
          year: 2024,
          description: "AI智能预测，精选300道高频题，历年命中率92%",
          price: 198,
          hitRate: 92.0,
          coverageRate: 85.6,
          rating: 4.7,
          downloadCount: 8960,
          reviewCount: 324,
          pageCount: 180,
          institutionName: "中公医考",
          isFeatured: true,
          isPremium: true,
        },
        {
          id: "4",
          name: "中医执业医师必背知识点手册",
          type: "PDF讲义",
          examType: "中医执业医师",
          subject: "中医基础",
          year: 2024,
          description: "口袋书设计，随时随地复习，包含所有必背内容",
          price: 0,
          hitRate: 78.5,
          coverageRate: 88.2,
          rating: 4.5,
          downloadCount: 6430,
          reviewCount: 198,
          pageCount: 128,
          institutionName: "华图医考",
          isFeatured: false,
          isPremium: false,
        },
        {
          id: "5",
          name: "药学职称考试精讲视频课程",
          type: "视频课程",
          examType: "药学职称",
          subject: "专业知识",
          year: 2024,
          description: "120课时精讲，名师授课，配套练习题",
          price: 398,
          hitRate: 86.3,
          coverageRate: 94.7,
          rating: 4.8,
          downloadCount: 4580,
          reviewCount: 267,
          institutionName: "润德教育",
          isFeatured: false,
          isPremium: true,
        },
        {
          id: "6",
          name: "执业药师法规速记宝典",
          type: "PDF讲义",
          examType: "执业药师",
          subject: "药事管理与法规",
          year: 2024,
          description: "法规条文归纳整理，图表记忆法，高效备考",
          price: 0,
          hitRate: 82.1,
          coverageRate: 90.4,
          rating: 4.6,
          downloadCount: 9120,
          reviewCount: 342,
          pageCount: 96,
          institutionName: "文都医考",
          isFeatured: false,
          isPremium: false,
        },
      ];

      setMaterials(mockData);
    } catch (error) {
      console.error("获取资料数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选
  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch =
      mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || mat.type === selectedType;
    const matchesExamType =
      selectedExamType === "all" || mat.examType === selectedExamType;
    return matchesSearch && matchesType && matchesExamType;
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
            <Link href="/institutions" className="text-gray-600 hover:text-blue-500 transition">
              机构对比
            </Link>
            <Link href="/materials" className="text-blue-500 font-medium">
              资料测评
            </Link>
            <Link href="/predictions" className="text-gray-600 hover:text-blue-500 transition">
              押题专区
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-blue-500 transition">
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
              <BookMarked className="w-4 h-4" />
              <span>学习资料测评对比</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              精选优质学习资料
            </h1>
            <p className="text-xl text-blue-100">
              客观评测各类资料命中率，助你高效备考
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "精选资料", value: materials.length, icon: BookOpen },
              { label: "平均命中率", value: "88%", icon: Target },
              { label: "总下载量", value: "50万+", icon: Download },
              { label: "用户评价", value: "2.5万+", icon: Star },
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

      {/* 资料类型标签 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          {MATERIAL_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition ${
                selectedType === type.id
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 hover:border-blue-300 bg-white"
              }`}
            >
              <type.icon className="w-5 h-5" />
              <span className="font-medium">{type.name}</span>
            </button>
          ))}
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索资料名称或关键词..."
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

        {/* 资料列表 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition border-2 border-gray-100 hover:border-blue-200 overflow-hidden group"
              >
                {/* 卡片头部 */}
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                  {material.isFeatured && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                      精选
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                      {material.type}
                    </span>
                    {material.price === 0 ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                        免费
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        ¥{material.price}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-500 transition">
                    {material.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {material.description}
                  </p>
                </div>

                {/* 卡片内容 */}
                <div className="p-6">
                  {/* 核心指标 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Target className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-2xl font-bold text-green-600">
                          {material.hitRate}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">命中率</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-2xl font-bold text-blue-600">
                          {material.coverageRate}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">覆盖率</div>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {material.rating}分
                      </span>
                      <span>{material.reviewCount}评价</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {material.downloadCount}下载
                      </span>
                      {material.pageCount && <span>{material.pageCount}页</span>}
                    </div>
                    {material.institutionName && (
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        {material.institutionName}
                      </div>
                    )}
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {material.examType}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {material.year}年
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    {material.price === 0 ? (
                      <button className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>免费下载</span>
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-1">
                          <ShoppingCart className="w-4 h-4" />
                          <span>立即购买</span>
                        </button>
                        <button className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">暂无相关资料</h3>
            <p className="text-gray-600">请尝试其他筛选条件</p>
          </div>
        )}
      </div>

      {/* CTA区域 */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">需要个性化学习方案？</h2>
          <p className="text-gray-600 mb-8">
            AI智能推荐系统为您匹配最适合的学习资料
          </p>
          <Link
            href="/recommend"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition space-x-2"
          >
            <span>获取AI推荐</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

