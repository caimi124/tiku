import { cn } from '@/lib/utils'

interface CoreDrugCardProps {
  title: string
  alias?: string
  why: string
  children: React.ReactNode
  examTag?: string
}

export function CoreDrugCard({ title, alias, why, children, examTag }: CoreDrugCardProps) {
  return (
    <div className="border border-emerald-100 rounded-2xl bg-emerald-50/40 p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
          🎯 必考核心
        </span>
        {examTag && (
          <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            {examTag}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {alias && <span className="text-sm text-slate-600">({alias})</span>}
      </div>
      <p className="text-sm text-slate-700 leading-6 mb-3">{why}</p>
      <div className="space-y-3 text-sm text-slate-700 leading-6">
        {children}
      </div>
    </div>
  )
}

export default CoreDrugCard

