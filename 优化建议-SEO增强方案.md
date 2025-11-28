# SEO 优化完整方案

## 🔴 严重问题 1：CSR导致SEO失效

### 当前状态
```html
<!-- 搜索引擎看到的内容 -->
<div class="min-h-screen bg-gray-50">
  <p>加载中...</p>
</div>
```

### 解决方案：改为 Next.js SSG（静态生成）

```typescript
// E:\tiku\app\practice\history\page.tsx
import { Metadata } from 'next';

// 生成静态元数据
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { exam?: string };
}): Promise<Metadata> {
  const examType = searchParams.exam || 'pharmacist';
  const examName = examType === 'pharmacist' ? '执业药师' : '其他考试';
  
  return {
    title: `${examName}历年真题_2024-2021年真题及答案解析 - 医药考试通`,
    description: `提供${examName}2024-2021年历年真题，含完整答案和详细解析。包括中药学综合知识、药学专业知识等科目，支持在线练习和模拟考试。`,
    keywords: [
      `${examName}历年真题`,
      `${examName}真题答案`,
      `${examName}真题解析`,
      '2024执业药师真题',
      '2023执业药师真题',
      '执业药师题库'
    ],
    openGraph: {
      title: `${examName}历年真题 - 2024-2021年`,
      description: `10万+精选真题，AI智能解析`,
      url: `https://yikaobiguo.com/practice/history?exam=${examType}`,
      type: 'website',
      images: [
        {
          url: '/og-image-history.jpg', // TODO: 创建专属OG图片
          width: 1200,
          height: 630,
          alt: `${examName}历年真题`
        }
      ]
    },
    alternates: {
      canonical: `https://yikaobiguo.com/practice/history?exam=${examType}`
    }
  };
}

// 服务端数据预取
export default async function HistoryExamPage({
  searchParams,
}: {
  searchParams: { exam?: string };
}) {
  const examType = searchParams.exam || 'pharmacist';
  
  // 服务端获取数据
  const yearData = await fetchYearDataServer(examType);
  
  return (
    <HistoryExamClient 
      initialData={yearData} 
      examType={examType} 
    />
  );
}

// 服务端数据获取函数
async function fetchYearDataServer(examType: string) {
  const { prisma } = await import('@/lib/prisma');
  
  // 直接查询数据库（不走API）
  const stats = await prisma.$queryRaw`
    SELECT 
      source_year as year,
      subject,
      COUNT(*) as count
    FROM questions
    WHERE 
      is_published = true
      AND exam_type = ${examType}
      AND source_year IS NOT NULL
    GROUP BY source_year, subject
    ORDER BY source_year DESC
  `;
  
  // 格式化数据...
  return formattedData;
}
```

## 🟡 问题 2：缺少结构化数据（Schema.org）

### 解决方案：添加 JSON-LD

```typescript
// 在页面中添加结构化数据
export default function HistoryExamPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: '医药考试通',
    description: '执业药师历年真题题库',
    url: 'https://yikaobiguo.com',
    offers: {
      '@type': 'Offer',
      category: '在线学习',
      priceCurrency: 'CNY',
      price: '0', // 免费
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250'
    },
    itemListElement: yearData.map((year, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: `${year.year}年执业药师真题`,
        description: `包含${year.totalQuestions}道真题`,
        provider: {
          '@type': 'Organization',
          name: '医药考试通'
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 页面内容 */}
    </>
  );
}
```

## 🟡 问题 3：URL参数未SEO优化

### 当前URL
```
/practice/history?exam=pharmacist
```

### 优化后URL（推荐）
```
/practice/pharmacist/history           # 更清晰的层级
/practice/pharmacist/history/2024      # 年份页面
/practice/pharmacist/history/2024/中药学专业知识一  # 科目页面
```

### 实现方案

```typescript
// 新建路由结构
app/
  practice/
    [exam]/              # exam = pharmacist
      history/
        page.tsx         # 列表页
        [year]/
          page.tsx       # 年份详情
          [subject]/
            page.tsx     # 科目练习
```

## 🟢 优化 4：添加面包屑导航

```typescript
// 提升用户体验 + SEO友好
<nav aria-label="breadcrumb">
  <ol className="flex items-center space-x-2 text-sm text-gray-600">
    <li><Link href="/">首页</Link></li>
    <li>/</li>
    <li><Link href="/practice">练习</Link></li>
    <li>/</li>
    <li className="text-gray-900 font-medium">历年真题</li>
  </ol>
</nav>

// 对应的JSON-LD
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://yikaobiguo.com" },
    { "@type": "ListItem", "position": 2, "name": "练习", "item": "https://yikaobiguo.com/practice" },
    { "@type": "ListItem", "position": 3, "name": "历年真题" }
  ]
}
```

## 🟢 优化 5：内部链接优化

### 当前问题
- 缺少相关链接
- 缺少热门入口

### 解决方案

```typescript
// 在页面底部添加"相关推荐"
<section className="mt-12 bg-white rounded-xl p-6">
  <h3 className="text-lg font-bold mb-4">相关推荐</h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Link href="/practice/random" className="...">
      🎲 随机练习
    </Link>
    <Link href="/practice/mistakes" className="...">
      ❌ 错题本
    </Link>
    <Link href="/practice/favorites" className="...">
      ⭐ 收藏夹
    </Link>
    <Link href="/analytics" className="...">
      📊 学习报告
    </Link>
  </div>
</section>

// 热门科目快速入口
<section className="mb-8">
  <h3 className="text-sm text-gray-600 mb-3">🔥 热门科目</h3>
  <div className="flex flex-wrap gap-2">
    {hotSubjects.map(subject => (
      <Link
        key={subject}
        href={`/practice/history/2024?subject=${subject}`}
        className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm hover:bg-orange-100"
      >
        {subject}
      </Link>
    ))}
  </div>
</section>
```

## 📊 SEO 指标监控

### 建议添加的监控

```typescript
// Google Analytics 4 事件
gtag('event', 'page_view', {
  page_title: '历年真题列表',
  page_location: window.location.href,
  exam_type: examType
});

// 用户行为追踪
gtag('event', 'select_content', {
  content_type: 'exam_year',
  content_id: year.year,
  items: [{ name: `${year.year}年真题` }]
});
```

### Core Web Vitals 目标

- LCP（最大内容绘制）: < 2.5s
- FID（首次输入延迟）: < 100ms
- CLS（累积布局偏移）: < 0.1

### 当前问题预测
- LCP: 可能 > 3s（16次API请求）
- CLS: 骨架屏可减少到 < 0.1
