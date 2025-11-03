"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
  Star,
  Users,
  Clock,
  ArrowRight,
  Zap,
  Trophy,
  Shield,
  Crown,
} from "lucide-react";

// 押题包类型
interface PredictionPackage {
  id: string;
  name: string;
  examType: string;
  subject: string;
  year: number;
  description: string;
  price: number;
  discountPrice: number;
  questionCount: number;
  hitRate: number;
  confidenceScore: number;
  features: string[];
  purchaseCount: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isHot: boolean;
}

// 考试类型
const EXAM_TYPES = [
  { id: "all", name: "全部考试" },
  { id: "pharmacist", name: "执业药师" },
  { id: "nurse", name: "护士/护师" },
  { id: "tcm-doctor", name: "中医执业医师" },
  { id: "clinical-doctor", name: "临床执业医师" },
];

export default function PredictionsPage() {
  const [packages, setPackages] = useState<PredictionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamType, setSelectedExamType] = useState("all");

  useEffect(() => {
    fetchPredictions();
  }, [selectedExamType]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      // const response = await fetch(`/api/predictions?examType=${selectedExamType}`);
      // const data = await response.json();

      // 模拟数据
      const mockData: PredictionPackage[] = [
        {
          id: "1",
          name: "2024执业药师考前冲刺押题包",
          examType: "执业药师",
          subject: "全科",
          year: 2024,
          description: "AI智能分析历年考题规律，精准预测2024年高频考点",
          price: 398,
          discountPrice: 198,
          questionCount: 500,
          hitRate: 92.5,
          confidenceScore: 95,
          features: ["AI智能预测", "名师精选", "真题同源", "考前密训", "命中率保障"],
          purchaseCount: 12580,
          rating: 4.9,
          reviewCount: 1246,
          isFeatured: true,
          isHot: true,
        },
        {
          id: "2",
          name: "护士资格终极押题300题",
          examType: "护士资格",
          subject: "全科",
          year: 2024,
          description: "历年押题命中率90%+，覆盖所有核心考点",
          price: 298,
          discountPrice: 148,
          questionCount: 300,
          hitRate: 90.2,
          confidenceScore: 92,
          features: ["高频考点", "精准预测", "快速提分", "考前必刷"],
          purchaseCount: 8960,
          rating: 4.8,
          reviewCount: 876,
          isFeatured: true,
          isHot: true,
        },
        {
          id: "3",
          name: "中医执业医师押题宝典",
          examType: "中医执业医师",
          subject: "综合",
          year: 2024,
          description: "中医名师团队精心编制，针对性强，覆盖全面",
          price: 498,
          discountPrice: 298,
          questionCount: 600,
          hitRate: 88.7,
          confidenceScore: 90,
          features: ["名师编制", "系统全面", "中医特色", "专项突破"],
          purchaseCount: 5420,
          rating: 4.7,
          reviewCount: 534,
          isFeatured: true,
          isHot: false,
        },
        {
          id: "4",
          name: "临床执业医师考前密卷",
          examType: "临床执业医师",
          subject: "全科",
          year: 2024,
          description: "模拟真实考试，提前适应考试节奏和难度",
          price: 598,
          discountPrice: 398,
          questionCount: 800,
          hitRate: 85.3,
          confidenceScore: 88,
          features: ["全真模拟", "难度把控", "时间管理", "考场还原"],
          purchaseCount: 6780,
          rating: 4.6,
          reviewCount: 652,
          isFeatured: false,
          isHot: false,
        },
        {
          id: "5",
          name: "执业药师法规专项押题",
          examType: "执业药师",
          subject: "药事管理与法规",
          year: 2024,
          description: "专攻法规科目，法条记忆技巧+高频考题",
          price: 198,
          discountPrice: 98,
          questionCount: 200,
          hitRate: 91.5,
          confidenceScore: 93,
          features: ["专项突破", "法条速记", "易错提醒", "高效提分"],
          purchaseCount: 9320,
          rating: 4.8,
          reviewCount: 892,
          isFeatured: false,
          isHot: true,
        },
        {
          id: "6",
          name: "护师晋升考试押题精华",
          examType: "护士/护师",
          subject: "专业实务",
          year: 2024,
          description: "针对护师晋升考试，精选高频考点和难点",
          price: 358,
          discountPrice: 178,
          questionCount: 400,
          hitRate: 87.8,
          confidenceScore: 89,
          features: ["晋升专用", "实战演练", "重点突出", "提分保障"],
          purchaseCount: 4560,
          rating: 4.7,
          reviewCount: 445,
          isFeatured: false,
          isHot: false,
        },
      ];

      setPackages(mockData);
    } catch (error) {
      console.error("获取押题包数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    return selectedExamType === "all" || pkg.examType === selectedExamType;
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
            <Link href="/materials" className="text-gray-600 hover:text-blue-500 transition">
              资料测评
            </Link>
            <Link href="/predictions" className="text-blue-500 font-medium">
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
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 animate-pulse">
              <Target className="w-4 h-4" />
              <span>AI智能押题系统</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              考前押题专区
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6">
              历年平均命中率 <span className="text-yellow-300 font-bold text-3xl">90%+</span>
            </p>
            <p className="text-lg text-blue-100">
              AI大数据分析 · 名师团队精选 · 真题同源训练
            </p>
          </div>

          {/* 核心优势卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Sparkles, label: "AI智能预测", value: "精准" },
              { icon: Trophy, label: "平均命中率", value: "90%+" },
              { icon: Shield, label: "质量保障", value: "退款承诺" },
              { icon: Users, label: "已帮助学员", value: "10万+" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-white/20 transition"
              >
                <item.icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold mb-1">{item.value}</div>
                <div className="text-sm text-blue-100">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 考试类型筛选 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          {EXAM_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedExamType(type.id)}
              className={`px-6 py-3 rounded-lg border-2 transition font-medium ${
                selectedExamType === type.id
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 hover:border-blue-300 bg-white"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* 押题包列表 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition border-2 overflow-hidden group relative ${
                  pkg.isFeatured
                    ? "border-yellow-400"
                    : "border-gray-100 hover:border-blue-200"
                }`}
              >
                {/* 标签 */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                  {pkg.isFeatured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-bold shadow-lg flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      精选
                    </span>
                  )}
                  {pkg.isHot && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                      🔥 热销
                    </span>
                  )}
                </div>

                {/* 卡片头部 */}
                <div
                  className={`relative p-6 ${
                    pkg.isFeatured
                      ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50"
                      : "bg-gradient-to-br from-blue-50 to-purple-50"
                  }`}
                >
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                      {pkg.examType}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-500 transition">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {pkg.description}
                  </p>

                  {/* 核心数据 */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {pkg.hitRate}%
                      </div>
                      <div className="text-xs text-gray-600">命中率</div>
                    </div>
                    <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {pkg.questionCount}
                      </div>
                      <div className="text-xs text-gray-600">题目数</div>
                    </div>
                    <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {pkg.confidenceScore}
                      </div>
                      <div className="text-xs text-gray-600">置信度</div>
                    </div>
                  </div>
                </div>

                {/* 卡片内容 */}
                <div className="p-6">
                  {/* 特色功能 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                      核心特色
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.features.slice(0, 4).map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {pkg.rating}分
                      </span>
                      <span>{pkg.reviewCount}人评价</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      已有 {pkg.purchaseCount.toLocaleString()} 人购买
                    </div>
                  </div>

                  {/* 价格和购买 */}
                  <div className="border-t pt-4">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-sm text-gray-500 line-through mr-2">
                          ¥{pkg.price}
                        </span>
                        <span className="text-3xl font-bold text-red-500">
                          ¥{pkg.discountPrice}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">限时优惠</div>
                        <div className="text-sm font-bold text-red-500">
                          省¥{pkg.price - pkg.discountPrice}
                        </div>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                      <span>立即购买</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">暂无相关押题包</h3>
            <p className="text-gray-600">请选择其他考试类型</p>
          </div>
        )}
      </div>

      {/* 命中率保障说明 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              为什么我们的押题命中率这么高？
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "AI大数据分析",
                  desc: "分析历年10000+真题，智能预测考试趋势",
                },
                {
                  icon: Award,
                  title: "名师团队精选",
                  desc: "50+资深讲师联合编制，确保质量",
                },
                {
                  icon: TrendingUp,
                  title: "真题同源训练",
                  desc: "题目来源与真题一致，提前适应考试",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-6 shadow-sm text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* 保障承诺 */}
            <div className="mt-8 bg-white rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-start space-x-4">
                <Shield className="w-12 h-12 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    100% 质量保障承诺
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    我们承诺：如果押题命中率低于70%，支持7天内无理由退款。
                    已有超过10万学员通过我们的押题包成功通过考试，平均命中率达90%以上。
                    您的信任，是我们不断进步的动力！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA区域 */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">还在犹豫？</h2>
          <p className="text-gray-600 mb-8">
            让AI帮你推荐最适合的押题包和学习方案
          </p>
          <Link
            href="/recommend"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>获取AI个性化推荐</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

