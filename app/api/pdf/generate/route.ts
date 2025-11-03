import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pdfType,
      config,
      content,
      userId,
      sessionId,
      hasWatermark = true,
      isPaid = false,
    } = body;

    // 验证必填字段
    if (!pdfType || !content) {
      return NextResponse.json(
        { error: "PDF类型和内容为必填项" },
        { status: 400 }
      );
    }

    // 根据类型生成不同的PDF
    let pdfContent;
    let filename;

    switch (pdfType) {
      case "recommendation_report":
        pdfContent = await generateRecommendationReport(content, config);
        filename = `AI推荐报告_${Date.now()}.pdf`;
        break;
      case "practice_set":
        pdfContent = await generatePracticeSet(content, config);
        filename = `练习题集_${Date.now()}.pdf`;
        break;
      case "study_plan":
        pdfContent = await generateStudyPlan(content, config);
        filename = `学习计划_${Date.now()}.pdf`;
        break;
      default:
        return NextResponse.json(
          { error: "不支持的PDF类型" },
          { status: 400 }
        );
    }

    // 添加水印（如果需要）
    if (hasWatermark && !isPaid) {
      pdfContent = addWatermark(pdfContent);
    }

    // 保存PDF生成记录
    const pdfGeneration = await prisma.pDFGeneration.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || `session_${Date.now()}`,
        pdfType,
        config: config || {},
        content,
        filename,
        fileUrl: null, // TODO: 上传到云存储后更新
        fileSize: null,
        hasWatermark,
        isPaid,
      },
    });

    // TODO: 实际生成PDF文件
    // 这里使用简单的HTML转PDF方案
    // 生产环境建议使用 puppeteer, jsPDF, pdfkit 等库
    const htmlContent = generateHTMLContent(pdfType, content, config, hasWatermark);

    return NextResponse.json({
      success: true,
      data: {
        generationId: pdfGeneration.id,
        filename,
        htmlContent, // 临时返回HTML，前端可以使用打印功能生成PDF
        downloadUrl: `/api/pdf/download/${pdfGeneration.id}`,
      },
    });
  } catch (error) {
    console.error("PDF生成错误:", error);
    return NextResponse.json(
      { error: "PDF生成失败" },
      { status: 500 }
    );
  }
}

// 生成推荐报告PDF内容
async function generateRecommendationReport(content: any, config: any) {
  const {
    examType,
    subjects,
    currentLevel,
    recommendations,
    reasoning,
  } = content;

  return {
    title: "AI智能推荐报告",
    sections: [
      {
        title: "基本信息",
        content: `
          考试类型: ${examType}
          备考科目: ${subjects.join(", ")}
          当前水平: ${currentLevel}
        `,
      },
      {
        title: "推荐理由",
        content: reasoning,
      },
      {
        title: "推荐机构",
        content: recommendations.institutions || [],
      },
      {
        title: "推荐资料",
        content: recommendations.materials || [],
      },
      {
        title: "学习计划",
        content: recommendations.studyPlan || [],
      },
    ],
  };
}

// 生成练习题集PDF内容
async function generatePracticeSet(content: any, config: any) {
  return {
    title: "个性化练习题集",
    sections: content.questions || [],
  };
}

// 生成学习计划PDF内容
async function generateStudyPlan(content: any, config: any) {
  return {
    title: "个性化学习计划",
    sections: content.plan || [],
  };
}

// 添加水印
function addWatermark(pdfContent: any) {
  return {
    ...pdfContent,
    watermark: "医药考试通 - yikaobiguo.com",
  };
}

// 生成HTML内容（用于PDF生成）
function generateHTMLContent(
  pdfType: string,
  content: any,
  config: any,
  hasWatermark: boolean
): string {
  const watermarkStyle = hasWatermark
    ? `
    <style>
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80px;
        color: rgba(0, 0, 0, 0.05);
        z-index: 9999;
        pointer-events: none;
        font-weight: bold;
      }
    </style>
    <div class="watermark">医药考试通 yikaobiguo.com</div>
  `
    : "";

  if (pdfType === "recommendation_report") {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI智能推荐报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      padding: 40px;
      line-height: 1.8;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 {
      font-size: 32px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      color: #1e40af;
      margin-bottom: 15px;
      padding-left: 10px;
      border-left: 4px solid #3b82f6;
    }
    .info-box {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #4b5563;
      display: inline-block;
      width: 100px;
    }
    .institution-card, .material-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .institution-card h3, .material-card h3 {
      color: #1e40af;
      margin-bottom: 10px;
    }
    .rating {
      color: #f59e0b;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .page-break { page-break-after: always; }
    }
  </style>
  ${watermarkStyle}
</head>
<body>
  <div class="header">
    <h1>🎯 AI智能推荐报告</h1>
    <p class="subtitle">生成时间: ${new Date().toLocaleString("zh-CN")}</p>
  </div>

  <div class="section">
    <h2 class="section-title">📋 基本信息</h2>
    <div class="info-box">
      <div class="info-item">
        <span class="info-label">考试类型:</span>
        <span>${content.examType || "未指定"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">备考科目:</span>
        <span>${(content.subjects || []).join("、") || "未指定"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">当前水平:</span>
        <span>${content.currentLevel || "未指定"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">预算范围:</span>
        <span>${content.budget || "未指定"}</span>
      </div>
      <div class="info-item">
        <span class="info-label">备考时间:</span>
        <span>${content.studyTime || "未指定"}</span>
      </div>
    </div>
  </div>

  ${
    content.reasoning
      ? `
  <div class="section">
    <h2 class="section-title">💡 推荐理由</h2>
    <div class="info-box">
      <p>${content.reasoning}</p>
    </div>
  </div>
  `
      : ""
  }

  ${
    content.recommendations?.institutions
      ? `
  <div class="section page-break">
    <h2 class="section-title">🏆 推荐培训机构</h2>
    ${content.recommendations.institutions
      .map(
        (inst: any) => `
      <div class="institution-card">
        <h3>${inst.name}</h3>
        <p>综合评分: <span class="rating">★ ${inst.rating || "N/A"}</span></p>
        <p>命中率评分: ${inst.hitRateRating || "N/A"} | 性价比评分: ${inst.priceRating || "N/A"}</p>
        <p>匹配度: ${inst.matchScore || "N/A"}分</p>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    content.recommendations?.materials
      ? `
  <div class="section">
    <h2 class="section-title">📚 推荐学习资料</h2>
    ${content.recommendations.materials
      .map(
        (mat: any) => `
      <div class="material-card">
        <h3>${mat.name}</h3>
        <p>类型: ${mat.type} | 命中率: ${mat.hitRate || "N/A"}% | 价格: ¥${mat.price || 0}</p>
        <p>评分: <span class="rating">★ ${mat.rating || "N/A"}</span> | 匹配度: ${mat.matchScore || "N/A"}分</p>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>本报告由 医药考试通 AI智能推荐系统生成</p>
    <p>官方网站: yikaobiguo.com</p>
  </div>
</body>
</html>
    `;
  }

  // 其他类型的PDF模板...
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${pdfType}</title>
  <style>
    body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; }
    h1 { color: #1e40af; }
  </style>
  ${watermarkStyle}
</head>
<body>
  <h1>PDF内容</h1>
  <pre>${JSON.stringify(content, null, 2)}</pre>
</body>
</html>
  `;
}

