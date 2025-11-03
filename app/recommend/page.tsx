"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Brain, 
  Target, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Award,
  Users
} from "lucide-react";

// 考试类型选项
const EXAM_TYPES = [
  { id: "pharmacist", name: "执业药师", icon: "💊", popular: true },
  { id: "nurse", name: "护士/护师", icon: "👩‍⚕️", popular: true },
  { id: "tcm-doctor", name: "中医执业医师", icon: "🌿", popular: true },
  { id: "chinese-pharmacist", name: "中药师", icon: "🍵", popular: false },
  { id: "clinical-doctor", name: "临床执业医师", icon: "🏥", popular: false },
  { id: "pharmacy-title", name: "药学职称", icon: "🎓", popular: false },
];

// 科目选项
const SUBJECTS: Record<string, string[]> = {
  pharmacist: ["药学专业知识一", "药学专业知识二", "药事管理与法规", "药学综合知识与技能"],
  nurse: ["基础护理学", "内科护理学", "外科护理学", "妇产科护理学"],
  "tcm-doctor": ["中医基础理论", "中医诊断学", "中药学", "方剂学", "针灸学"],
  "chinese-pharmacist": ["中药学专业知识一", "中药学专业知识二", "中药综合知识与技能"],
  "clinical-doctor": ["基础医学综合", "临床医学综合", "人文医学综合"],
  "pharmacy-title": ["基础知识", "相关专业知识", "专业知识", "专业实践能力"],
};

// 基础水平选项
const LEVELS = [
  { id: "beginner", name: "零基础", description: "刚开始备考，需要系统学习" },
  { id: "intermediate", name: "有基础", description: "有一定基础，需要强化提升" },
  { id: "advanced", name: "基础较好", description: "基础扎实，冲刺高分" },
];

export default function RecommendPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    examType: "",
    subjects: [] as string[],
    budget: "",
    studyTime: "",
    currentLevel: "",
    targetScore: "",
  });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  // 处理考试类型选择
  const handleExamTypeSelect = (typeId: string) => {
    setFormData({ ...formData, examType: typeId, subjects: [] });
    setStep(2);
  };

  // 处理科目选择
  const handleSubjectToggle = (subject: string) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter((s) => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects: newSubjects });
  };

  // 生成推荐
  const handleGenerateRecommendation = async () => {
    setLoading(true);
    
    // 模拟AI推荐过程
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 2000);
  };

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              s === step
                ? "bg-blue-500 text-white"
                : s < step
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {s < step ? <CheckCircle className="w-6 h-6" /> : s}
          </div>
          {s < 4 && (
            <div
              className={`w-16 h-1 mx-2 ${
                s < step ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // 步骤1：选择考试类型
  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">选择您的考试类型</h2>
        <p className="text-gray-600">选择您准备参加的考试</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAM_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleExamTypeSelect(type.id)}
            className={`relative p-6 border-2 rounded-xl hover:border-blue-500 hover:shadow-lg transition text-left group ${
              formData.examType === type.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            {type.popular && (
              <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                热门
              </span>
            )}
            <div className="text-4xl mb-3">{type.icon}</div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-blue-500 transition">
              {type.name}
            </h3>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition mt-2" />
          </button>
        ))}
      </div>
    </div>
  );

  // 步骤2：选择科目和备考信息
  const renderStep2 = () => {
    const subjects = SUBJECTS[formData.examType] || [];
    
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">选择备考科目</h2>
          <p className="text-gray-600">可多选，至少选择一个科目</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="grid md:grid-cols-2 gap-3">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectToggle(subject)}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.subjects.includes(subject)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{subject}</span>
                  {formData.subjects.includes(subject) && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            上一步
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={formData.subjects.length === 0}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
          </button>
        </div>
      </div>
    );
  };

  // 步骤3：基础水平和目标
  const renderStep3 = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">您的基础水平</h2>
        <p className="text-gray-600">帮助我们为您推荐最合适的学习方案</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="grid gap-4 mb-6">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setFormData({ ...formData, currentLevel: level.id })}
              className={`p-5 border-2 rounded-lg text-left transition ${
                formData.currentLevel === level.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">{level.name}</h3>
                  <p className="text-gray-600 text-sm">{level.description}</p>
                </div>
                {formData.currentLevel === level.id && (
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              目标分数（可选）
            </label>
            <input
              type="number"
              value={formData.targetScore}
              onChange={(e) =>
                setFormData({ ...formData, targetScore: e.target.value })
              }
              placeholder="例如：90"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          上一步
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!formData.currentLevel}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步
        </button>
      </div>
    </div>
  );

  // 步骤4：预算和时间
  const renderStep4 = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">预算和学习时间</h2>
        <p className="text-gray-600">告诉我们您的学习计划</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              预算范围（元）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["1000以下", "1000-3000", "3000-5000", "5000以上"].map((range) => (
                <button
                  key={range}
                  onClick={() => setFormData({ ...formData, budget: range })}
                  className={`py-3 px-4 border-2 rounded-lg font-medium transition ${
                    formData.budget === range
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              距离考试时间
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["1个月内", "1-3个月", "3-6个月", "6个月以上"].map((time) => (
                <button
                  key={time}
                  onClick={() => setFormData({ ...formData, studyTime: time })}
                  className={`py-3 px-4 border-2 rounded-lg font-medium transition ${
                    formData.studyTime === time
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(3)}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          上一步
        </button>
        <button
          onClick={handleGenerateRecommendation}
          disabled={!formData.budget || !formData.studyTime}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>生成AI推荐方案</span>
        </button>
      </div>
    </div>
  );

  // 加载中动画
  const renderLoading = () => (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
      <h3 className="text-2xl font-bold mb-3">AI正在分析您的需求...</h3>
      <p className="text-gray-600">
        正在为您匹配最合适的学习方案，请稍候
      </p>
    </div>
  );

  // 推荐结果页面
  const renderResults = () => {
    const selectedExam = EXAM_TYPES.find((e) => e.id === formData.examType);
    
    return (
      <div className="max-w-5xl mx-auto">
        {/* 结果概览 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-8 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl font-bold">您的AI智能推荐方案</h2>
            </div>
            <button className="px-4 py-2 bg-white text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition">
              下载PDF报告
            </button>
          </div>
          <p className="text-blue-100">
            基于您的{selectedExam?.name}备考需求，我们为您推荐以下学习方案
          </p>
        </div>

        {/* 推荐的机构 */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-blue-500" />
            推荐培训机构
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "医学教育网",
                rating: 4.8,
                students: "12万+",
                hitRate: "92%",
                price: "2980",
                tags: ["名师授课", "高通过率", "全程督学"],
              },
              {
                name: "环球网校",
                rating: 4.6,
                students: "8万+",
                hitRate: "89%",
                price: "2580",
                tags: ["性价比高", "课程丰富", "服务完善"],
              },
            ].map((inst, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{inst.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {inst.rating}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {inst.students}学员
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-500">
                      ¥{inst.price}
                    </div>
                    <div className="text-sm text-gray-500">起</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">命中率</div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: inst.hitRate }}
                      ></div>
                    </div>
                    <span className="font-bold text-green-600">{inst.hitRate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {inst.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
                    查看详情
                  </button>
                  <button className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition">
                    对比
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 推荐的资料 */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
            推荐学习资料
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "核心考点精编", type: "PDF讲义", price: "免费", hit: "88%" },
              { name: "历年真题详解", type: "真题集", price: "¥98", hit: "95%" },
              { name: "考前押题包", type: "押题", price: "¥198", hit: "92%" },
            ].map((material, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold mb-1">{material.name}</h4>
                    <span className="text-sm text-gray-500">{material.type}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {material.hit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-blue-500">
                    {material.price}
                  </span>
                  <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition">
                    获取
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA按钮 */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            立即开始您的学习之旅
          </h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2">
              <span>下载完整推荐报告</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setStep(1);
                setFormData({
                  examType: "",
                  subjects: [],
                  budget: "",
                  studyTime: "",
                  currentLevel: "",
                  targetScore: "",
                });
              }}
              className="px-8 py-4 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              重新测评
            </button>
          </div>
        </div>
      </div>
    );
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
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-500 transition"
          >
            返回首页
          </Link>
        </div>
      </nav>

      {/* 页面标题 */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            <span>AI智能推荐系统</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            找到最适合您的学习方案
          </h1>
          <p className="text-xl text-gray-600">
            告诉我们您的需求，AI为您匹配最佳的培训机构和学习资料
          </p>
        </div>

        {/* 步骤内容 */}
        {!showResults && !loading && (
          <>
            {renderStepIndicator()}
            <div className="mt-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>
          </>
        )}

        {loading && renderLoading()}
        {showResults && renderResults()}
      </div>
    </div>
  );
}

