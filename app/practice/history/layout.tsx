import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '执业药师历年真题 - 2022-2024年真题库 | 医药考试通',
  description: '执业药师历年真题精选，涵盖2022-2024年1440+道真题，包含中药学、药学、法规、药综四大科目，按年份和科目分类练习，配有详细解析，助你把握考试趋势和命题规律。',
  keywords: '执业药师真题,历年真题,执业药师考试,中药学真题,药学真题,法规真题,药综真题,医考真题,刷题',
  openGraph: {
    title: '执业药师历年真题库 - 1440+道精选真题',
    description: '2022-2024年执业药师历年真题全收录，按年份/科目分类，配详细解析',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
