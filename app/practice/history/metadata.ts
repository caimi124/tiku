/**
 * SEO元数据配置
 * 用于历年真题页面的搜索引擎优化
 */

import { Metadata } from 'next';

export const historyPageMetadata: Metadata = {
  title: '执业药师历年真题库(2022-2024年) - 1680+道真题免费练习 | 医药考试通',
  description: '提供2022-2024年执业药师考试历年真题，包含药学、中药学4科全部1680+道题目，配详细解析和答案。90%+命中率，智能推荐薄弱环节，助你高效备考通关。',
  keywords: [
    '执业药师真题',
    '历年真题',
    '药学真题',
    '中药学真题',
    '执业药师考试',
    '在线刷题',
    '药事管理与法规',
    '药学综合知识与技能',
    '中药学综合知识与技能',
    '2024年真题',
    '2023年真题',
    '2022年真题',
    '免费题库',
    '医药考试',
  ].join(','),
  
  authors: [{ name: '医药考试通' }],
  
  openGraph: {
    title: '执业药师历年真题库 - 1680+道真题免费练习',
    description: '2022-2024年真题全收录，按年份/科目分类练习，把握考试趋势和命题规律',
    url: 'https://yikaobiguo.com/practice/history?exam=pharmacist',
    siteName: '医药考试通',
    images: [
      {
        url: 'https://yikaobiguo.com/og-history-questions.jpg',
        width: 1200,
        height: 630,
        alt: '执业药师历年真题库',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: '执业药师历年真题库 - 1680+道真题',
    description: '2022-2024年真题全收录，智能推荐，高效备考',
    images: ['https://yikaobiguo.com/og-history-questions.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: 'https://yikaobiguo.com/practice/history?exam=pharmacist',
  },
  
  other: {
    'baidu-site-verification': 'codeva-xxxxx', // 百度站长验证码
    'google-site-verification': 'xxxxx', // Google Search Console验证码
  },
};

/**
 * 生成结构化数据（JSON-LD）
 */
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: '执业药师历年真题库',
    description: '提供2022-2024年执业药师考试历年真题，包含药学、中药学4科全部题目',
    provider: {
      '@type': 'Organization',
      name: '医药考试通',
      url: 'https://yikaobiguo.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yikaobiguo.com/logo.png',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '5230',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
    },
    educationalLevel: '专业资格考试',
    coursePrerequisites: '医药相关专业背景',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        name: '2024年执业药师真题',
        courseMode: 'online',
        courseWorkload: 'PT10H', // 预计10小时完成
      },
      {
        '@type': 'CourseInstance',
        name: '2023年执业药师真题',
        courseMode: 'online',
        courseWorkload: 'PT8H',
      },
      {
        '@type': 'CourseInstance',
        name: '2022年执业药师真题',
        courseMode: 'online',
        courseWorkload: 'PT10H',
      },
    ],
  };
}

/**
 * 生成面包屑导航结构化数据
 */
export function generateBreadcrumbStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: 'https://yikaobiguo.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '在线练习',
        item: 'https://yikaobiguo.com/practice',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '历年真题',
        item: 'https://yikaobiguo.com/practice/history',
      },
    ],
  };
}

/**
 * 生成FAQ结构化数据
 */
export function generateFAQStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '执业药师历年真题有多少道？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '我们提供2022-2024年执业药师考试历年真题，共计1680+道题目，涵盖药学类和中药学类所有科目。',
        },
      },
      {
        '@type': 'Question',
        name: '历年真题是否免费？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '是的，所有历年真题完全免费，无需注册即可练习。我们致力于为考生提供优质的学习资源。',
        },
      },
      {
        '@type': 'Question',
        name: '真题是否有详细解析？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '每道题目都配有详细的答案解析，帮助您理解考点和解题思路，而不仅仅是记住答案。',
        },
      },
      {
        '@type': 'Question',
        name: '如何使用历年真题备考？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '建议先从最新年份开始练习，了解最新考试趋势。做错的题目要及时收录到错题本，定期复习。完成所有年份真题后，可进行模拟考试检验学习成果。',
        },
      },
      {
        '@type': 'Question',
        name: '历年真题的命中率如何？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '根据历年考生反馈，我们的真题库命中率超过90%。通过练习历年真题，可以有效把握考试重点和命题规律。',
        },
      },
    ],
  };
}

