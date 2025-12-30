'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState<string>('正在完成登录...')

  useEffect(() => {
    const supabase = getSupabaseClient()
    
    const handleCallback = async () => {
      try {
        // 检查 URL hash 中是否有 access_token（Magic Link 回调）
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // 设置会话
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (setError) {
            setStatus('error')
            setMessage('登录失败，请重试')
            return
          }
        }
        
        // 验证会话是否已建立
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setStatus('error')
          setMessage('登录失败，请重试')
          return
        }
        
        setStatus('success')
        setMessage('登录完成，正在返回...')
        
        // 清除 URL hash
        window.history.replaceState(null, '', window.location.pathname)
        
        setTimeout(() => {
          router.replace('/')
        }, 1200)
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setMessage('登录失败，请重试')
      }
    }
    
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
        <p className="text-lg font-semibold text-slate-900">
          {status === 'pending' && '正在完成登录...'}
          {status === 'success' && '登录成功'}
          {status === 'error' && '登录失败'}
        </p>
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}

