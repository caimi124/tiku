import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      examType,
      subjects,
      budget,
      studyTime,
      currentLevel,
      targetScore,
      userId,
      sessionId,
    } = body;

    // 验证必填字段
    if (!examType || !subjects || subjects.length === 0) {
      return NextResponse.json(
        { error: "考试类型和科目为必填项" },
        { status: 400 }
      );
    }

    // AI推荐逻辑（简化版，实际应该调用更复杂的算法）
    const recommendations = await generateRecommendations({
      examType,
      subjects,
      budget,
      studyTime,
      currentLevel,
      targetScore,
    });

    // 保存推荐记录
    const recommendation = await prisma.recommendation.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || `session_${Date.now()}`,
        examType,
        subjects,
        budget: budget ? parseFloat(budget) : null,
        studyTime: studyTime ? parseInt(studyTime) : null,
        currentLevel: currentLevel || null,
        targetScore: targetScore ? parseInt(targetScore) : null,
        recommendedItems: recommendations,
        reasoning: generateReasoning(recommendations, {
          examType,
          currentLevel,
          budget,
          studyTime,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendationId: recommendation.id,
        recommendations: recommendations,
        reasoning: recommendation.reasoning,
      },
    });
  } catch (error) {
    console.error("推荐生成错误:", error);
    return NextResponse.json(
      { error: "推荐生成失败" },
      { status: 500 }
    );
  }
}

// 生成推荐内容
async function generateRecommendations(criteria: any) {
  const { examType, subjects, budget, studyTime, currentLevel } = criteria;

  // 获取匹配的机构
  const institutions = await prisma.institution.findMany({
    where: {
      isVerified: true,
    },
    orderBy: {
      overallRating: "desc",
    },
    take: 3,
  });

  // 获取匹配的资料
  const materials = await prisma.material.findMany({
    where: {
      examType: examType,
      isActive: true,
    },
    orderBy: [
      { hitRate: "desc" },
      { rating: "desc" },
    ],
    take: 5,
  });

  // 获取押题包
  const predictionPackages = await prisma.predictionPackage.findMany({
    where: {
      examType: examType,
      isActive: true,
      isFeatured: true,
    },
    orderBy: {
      hitRate: "desc",
    },
    take: 3,
  });

  return {
    institutions: institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      logo: inst.logo,
      rating: inst.overallRating,
      hitRateRating: inst.hitRateRating,
      priceRating: inst.priceRating,
      reviewCount: inst.reviewCount,
      matchScore: calculateMatchScore(inst, criteria),
    })),
    materials: materials.map((mat) => ({
      id: mat.id,
      name: mat.name,
      type: mat.type,
      hitRate: mat.hitRate,
      price: mat.price,
      rating: mat.rating,
      matchScore: calculateMaterialMatchScore(mat, criteria),
    })),
    predictionPackages: predictionPackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      hitRate: pkg.hitRate,
      questionCount: pkg.questionCount,
      features: pkg.features,
    })),
    studyPlan: generateStudyPlan(criteria),
  };
}

// 计算匹配分数
function calculateMatchScore(institution: any, criteria: any): number {
  let score = institution.overallRating * 20; // 基础评分

  // 根据预算调整
  if (criteria.budget) {
    const budgetValue = parseBudget(criteria.budget);
    // 预算匹配逻辑
    if (budgetValue >= 3000) {
      score += institution.isPremium ? 10 : 0;
    }
  }

  // 根据学习时间调整
  if (criteria.studyTime) {
    // 时间紧急的推荐高效机构
    if (criteria.studyTime.includes("1个月")) {
      score += institution.hitRateRating * 5;
    }
  }

  return Math.min(score, 100);
}

// 计算资料匹配分数
function calculateMaterialMatchScore(material: any, criteria: any): number {
  let score = (material.rating || 4.0) * 20;
  
  if (material.hitRate) {
    score += material.hitRate * 0.5;
  }

  // 根据基础水平推荐不同难度
  if (criteria.currentLevel === "beginner") {
    if (material.type.includes("基础") || material.type.includes("入门")) {
      score += 15;
    }
  } else if (criteria.currentLevel === "advanced") {
    if (material.type.includes("押题") || material.type.includes("冲刺")) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

// 解析预算
function parseBudget(budget: string): number {
  if (budget.includes("1000以下")) return 1000;
  if (budget.includes("1000-3000")) return 2000;
  if (budget.includes("3000-5000")) return 4000;
  if (budget.includes("5000以上")) return 6000;
  return 2000;
}

// 生成学习计划
function generateStudyPlan(criteria: any) {
  const { studyTime, currentLevel, subjects } = criteria;
  
  const plans = [];
  
  if (studyTime?.includes("1个月")) {
    plans.push({
      phase: "冲刺阶段",
      duration: "1个月",
      focus: ["重点知识点突破", "历年真题训练", "押题包冲刺"],
      dailyHours: "4-6小时",
    });
  } else if (studyTime?.includes("3-6个月")) {
    plans.push(
      {
        phase: "基础阶段",
        duration: "2个月",
        focus: ["系统学习教材", "章节练习", "知识点梳理"],
        dailyHours: "2-3小时",
      },
      {
        phase: "强化阶段",
        duration: "2个月",
        focus: ["真题训练", "错题总结", "专项突破"],
        dailyHours: "3-4小时",
      },
      {
        phase: "冲刺阶段",
        duration: "1个月",
        focus: ["模拟考试", "押题训练", "查漏补缺"],
        dailyHours: "4-5小时",
      }
    );
  }

  return plans;
}

// 生成推荐理由
function generateReasoning(recommendations: any, criteria: any): string {
  const reasons = [];

  if (criteria.currentLevel === "beginner") {
    reasons.push("您是零基础学员，我们为您推荐了系统性强、讲解详细的培训课程");
  } else if (criteria.currentLevel === "advanced") {
    reasons.push("您有较好基础，我们为您推荐了高效冲刺类课程和押题资料");
  }

  if (criteria.studyTime?.includes("1个月")) {
    reasons.push("考虑到您的备考时间较紧，推荐了高命中率的押题包和冲刺课程");
  }

  if (criteria.budget) {
    const budgetValue = parseBudget(criteria.budget);
    if (budgetValue < 2000) {
      reasons.push("根据您的预算，我们优先推荐了性价比高的课程");
    } else {
      reasons.push("您的预算充足，我们为您推荐了业内顶级的培训机构");
    }
  }

  return reasons.join("；") + "。";
}

