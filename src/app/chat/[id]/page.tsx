'use client'

import { use } from 'react'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Chat from '@/components/Chat'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const resolvedParams = use(params)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <div className="container mx-auto px-4 py-8">
        <Chat roomId={resolvedParams.id} />
      </div>
    </div>
  )
}

