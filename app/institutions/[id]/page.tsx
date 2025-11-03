"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Users,
  Award,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  ThumbsUp,
  Clock,
} from "lucide-react";

export default function InstitutionDetailPage() {
  const params = useParams();
  const institutionId = params.id as string;
  const [institution, setInstitution] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "reviews">("overview");

  useEffect(() => {
    fetchInstitutionDetail();
  }, [institutionId]);

  const fetchInstitutionDetail = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      // const response = await fetch(`/api/institutions/${institutionId}`);
      // const data = await response.json();

      // 模拟数据
      const mockInstitution = {
        id: institutionId,
        name: "医学教育网",
        logo: null,
        description: "国内领先的医学远程教育基地，专注医药卫生类考试培训20年",
        foundedYear: 2003,
        website: "https://www.med66.com",
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
        contactInfo: {
          phone: "400-650-1888",
          email: "service@med66.com",
          wechat: "med66_service",
        },
        highlights: [
          "连续10年行业领先",
          "92%平均通过率",
          "50+名师团队",
          "24小时在线答疑",
        ],
      };

      const mockCourses = [
        {
          id: "1",
          name: "执业药师-全科通关班",
          examType: "执业药师",
          price: 2980,
          discountPrice: 1980,
          duration: 240,
          rating: 4.9,
          enrollCount: 8520,
        },
        {
          id: "2",
          name: "护士资格-高效定制班",
          examType: "护士资格",
          price: 1580,
          discountPrice: 980,
          duration: 180,
          rating: 4.7,
          enrollCount: 6340,
        },
        {
          id: "3",
          name: "中医执业医师-VIP无忧班",
          examType: "中医执业医师",
          price: 3980,
          discountPrice: 2680,
          duration: 320,
          rating: 4.8,
          enrollCount: 4210,
        },
      ];

      const mockReviews = [
        {
          id: "1",
          userName: "张同学",
          userAvatar: null,
          overallRating: 5,
          content: "老师讲得非常详细，重点突出，押题也很准确。我是零基础，跟着课程学习，一次通过了执业药师考试。客服态度也很好，有问必答。强烈推荐！",
          examType: "执业药师",
          passedExam: true,
          helpfulCount: 128,
          createdAt: "2024-10-15",
        },
        {
          id: "2",
          userName: "李医师",
          userAvatar: null,
          overallRating: 4,
          content: "课程内容很全面，老师经验丰富。美中不足的是有些课程更新不够及时，希望能加强这方面。总体来说性价比还是不错的。",
          examType: "药学职称",
          passedExam: true,
          helpfulCount: 86,
          createdAt: "2024-10-10",
        },
        {
          id: "3",
          userName: "王同学",
          userAvatar: null,
          overallRating: 5,
          content: "非常棒的学习体验！习题库很丰富，APP使用也很方便，可以随时随地学习。学习群里的老师解答也很及时，为我节省了很多时间。",
          examType: "护士资格",
          passedExam: true,
          helpfulCount: 94,
          createdAt: "2024-10-05",
        },
      ];

      setInstitution(mockInstitution);
      setCourses(mockCourses);
      setReviews(mockReviews);
    } catch (error) {
      console.error("获取机构详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">机构不存在</h2>
          <Link href="/institutions" className="text-blue-500 hover:underline">
            返回机构列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">医药考试通</span>
          </Link>
          <Link
            href="/institutions"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回列表</span>
          </Link>
        </div>
      </nav>

      {/* 机构头部信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 左侧：基本信息 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-4xl font-bold">{institution.name}</h1>
                      {institution.isVerified && (
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      )}
                      {institution.isPremium && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-medium">
                          金牌机构
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-lg mb-4">{institution.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        成立于 {institution.foundedYear}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {(institution.studentCount / 10000).toFixed(1)}万学员
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {institution.courseCount}门课程
                      </span>
                    </div>
                  </div>
                </div>

                {/* 评分数据 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="text-3xl font-bold">{institution.overallRating}</span>
                    </div>
                    <div className="text-sm text-gray-600">综合评分</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
                      <span className="text-3xl font-bold">{institution.hitRateRating}</span>
                    </div>
                    <div className="text-sm text-gray-600">命中率</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-5 h-5 text-blue-500 mr-1" />
                      <span className="text-3xl font-bold">{institution.priceRating}</span>
                    </div>
                    <div className="text-sm text-gray-600">性价比</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <ThumbsUp className="w-5 h-5 text-purple-500 mr-1" />
                      <span className="text-3xl font-bold">{institution.serviceRating}</span>
                    </div>
                    <div className="text-sm text-gray-600">服务质量</div>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2">
                  {institution.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 右侧：联系方式和操作 */}
              <div className="lg:w-80">
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-bold text-lg mb-4">联系方式</h3>
                  
                  {institution.contactInfo.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{institution.contactInfo.phone}</span>
                    </div>
                  )}
                  
                  {institution.contactInfo.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{institution.contactInfo.email}</span>
                    </div>
                  )}
                  
                  {institution.website && (
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-blue-500 hover:underline"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-sm">访问官网</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="pt-4 space-y-3">
                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition">
                      立即咨询
                    </button>
                    <button className="w-full py-3 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition">
                      获取优惠
                    </button>
                  </div>
                </div>

                {/* 亮点 */}
                <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    机构亮点
                  </h3>
                  <ul className="space-y-2">
                    {institution.highlights.map((highlight: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="flex border-b">
            {[
              { id: "overview", label: "机构概况" },
              { id: "courses", label: `课程列表 (${courses.length})` },
              { id: "reviews", label: `学员评价 (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* 机构概况 */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">关于我们</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {institution.description}
                    作为国内医学教育领域的领军企业，我们致力于为医学考生提供最优质的教育服务。
                    拥有强大的师资团队和完善的课程体系，帮助数十万学员成功通过考试。
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">核心优势</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "名师团队", desc: "50+行业资深讲师，平均教龄10年以上" },
                      { title: "高通过率", desc: "学员平均通过率达92%，远超行业平均水平" },
                      { title: "智能题库", desc: "10万+精选题目，AI智能推荐学习路径" },
                      { title: "贴心服务", desc: "24小时在线答疑，专属学习顾问全程跟踪" },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 课程列表 */}
            {activeTab === "courses" && (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-6 border-2 border-gray-100 rounded-lg hover:border-blue-200 transition"
                  >
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-2">{course.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {course.rating}分
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.enrollCount}人已报名
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {course.duration}课时
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                        {course.examType}
                      </span>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-sm text-gray-500 line-through mb-1">
                        ¥{course.price}
                      </div>
                      <div className="text-3xl font-bold text-red-500 mb-3">
                        ¥{course.discountPrice}
                      </div>
                      <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        立即购买
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 学员评价 */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{review.userName}</div>
                          <div className="text-sm text-gray-500">{review.createdAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.overallRating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                        {review.examType}
                      </span>
                      {review.passedExam && (
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          已通过考试
                        </span>
                      )}
                      <button className="flex items-center text-gray-500 hover:text-blue-500 transition">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        有帮助 ({review.helpfulCount})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

