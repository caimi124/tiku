'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/auth'
import { cn } from '@/lib/utils'

type LoadState = 'idle' | 'loading' | 'saving'

interface LearnedToggleProps {
  pointId: string
}

export function LearnedToggle({ pointId }: LearnedToggleProps) {
  const supabase = getSupabaseClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [learned, setLearned] = useState(false)
  const [state, setState] = useState<LoadState>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchStatus = async () => {
      setState('loading')
      const { data: userData } = await supabase.auth.getUser()
      if (!mounted) return
      const user = userData.user
      if (!user) {
        setUserId(null)
        setLearned(false)
        setState('idle')
        return
      }
      setUserId(user.id)
      const { data, error } = await supabase
        .from('user_point_progress')
        .select('learned')
        .eq('user_id', user.id)
        .eq('point_id', pointId)
        .maybeSingle()
      if (!mounted) return
      if (error && error.code !== 'PGRST116') {
        setError('加载学习状态失败')
      } else {
        setLearned(Boolean(data?.learned))
      }
      setState('idle')
    }
    fetchStatus()
    return () => {
      mounted = false
    }
  }, [pointId, supabase])

  const toggle = async () => {
    if (!userId) {
      setError('登录后可记录学习进度')
      return
    }
    setError(null)
    setState('saving')
    const next = !learned
    setLearned(next)
    const { error: upsertError } = await supabase
      .from('user_point_progress')
      .upsert({
        user_id: userId,
        point_id: pointId,
        learned: next,
        learned_at: next ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
    if (upsertError) {
      setLearned(!next)
      setError('保存失败，请重试')
    }
    setState('idle')
  }

  const disabled = state !== 'idle'

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || !userId}
        className={cn(
          'px-3 py-2 text-sm font-semibold rounded-lg border transition-colors',
          learned
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
          (disabled || !userId) && 'opacity-70 cursor-not-allowed'
        )}
        title={!userId ? '登录后可记录学习进度' : undefined}
      >
        {state === 'saving' ? '保存中…' : learned ? '已学完 ✓' : '我已学完'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {!userId && (
        <span className="text-xs text-slate-500">登录后可记录学习进度</span>
      )}
    </div>
  )
}

export default LearnedToggle

