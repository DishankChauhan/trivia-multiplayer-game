'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import Game from '@/components/Game'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function GamePage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleChatRoomsClick = () => {
    router.push('/rooms')
  }

  const handlePlayGame = () => {
    setGameStarted(true)
  }

  const handleGameEnd = useCallback(async () => {
    setGameStarted(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8 space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayGame}
              className="px-6 py-3 rounded-full font-bold shadow-md transition duration-300 bg-blue-500 text-white"
            >
              <Image src="/images/game-icon.png" alt="Game" width={24} height={24} className="inline-block mr-2" />
              Play Game
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChatRoomsClick}
              className="px-6 py-3 rounded-full font-bold shadow-md transition duration-300 bg-gray-200 text-gray-700"
            >
              <Image src="/images/chat-icon.png" alt="Chat" width={24} height={24} className="inline-block mr-2" />
              Chat Rooms
            </motion.button>
          </motion.div>
        )}
        <div className="bg-white rounded-lg shadow-xl p-8 w-full">
          <Game gameStarted={gameStarted} onGameEndAction={handleGameEnd} />
        </div>
      </div>
    </div>
  )
}

