import { cn } from '@/lib/utils'

interface ExamHintCardProps {
  children: React.ReactNode
  className?: string
}

export function ExamHintCard({ children, className }: ExamHintCardProps) {
  return (
    <div
      className={cn(
        'border border-slate-200 rounded-xl bg-slate-50/80 p-4 md:p-5 shadow-sm',
        'hover:shadow-md transition-shadow',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default ExamHintCard

