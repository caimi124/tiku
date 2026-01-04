import { cn } from '@/lib/utils'
import { BookOpen, Flame, Pill, Target, BarChart3 } from 'lucide-react'

type SectionKind = 'examMap' | 'highYield' | 'coreDrug' | 'source' | 'distribution' | 'generic'

const ICONS: Record<SectionKind, JSX.Element> = {
  examMap: <Target className="w-5 h-5 text-blue-500" />,
  highYield: <Flame className="w-5 h-5 text-amber-500" />,
  coreDrug: <Pill className="w-5 h-5 text-emerald-500" />,
  source: <BookOpen className="w-5 h-5 text-slate-500" />,
  distribution: <BarChart3 className="w-5 h-5 text-indigo-500" />,
  generic: <BookOpen className="w-5 h-5 text-slate-500" />,
}

export interface SectionHeaderProps {
  title: string
  kind?: SectionKind
  className?: string
}

export function SectionHeader({ title, kind = 'generic', className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex items-center justify-center rounded-md bg-slate-100 p-1.5">
        {ICONS[kind]}
      </span>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    </div>
  )
}

export default SectionHeader

