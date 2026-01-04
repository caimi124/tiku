import { cn } from '@/lib/utils'

interface InfoPanelProps {
  className?: string
  children: React.ReactNode
  accentColor?: 'blue' | 'emerald' | 'amber' | 'slate'
}

const accentMap: Record<NonNullable<InfoPanelProps['accentColor']>, string> = {
  blue: 'border-l-4 border-blue-500',
  emerald: 'border-l-4 border-emerald-500',
  amber: 'border-l-4 border-amber-500',
  slate: 'border-l-4 border-slate-400',
}

export function InfoPanel({ className, children, accentColor = 'blue' }: InfoPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-slate-50/80 p-4 md:p-5 shadow-sm',
        accentMap[accentColor],
        className,
      )}
    >
      {children}
    </div>
  )
}

export default InfoPanel

