'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Game from '@/components/Game'
import Chat from '@/components/Chat'

interface Room {
  id: string;
  players: string[];
  gameStarted: boolean;
}

export default function Room() {
  const params = useParams() as { id: string }
  const roomId = params.id
  const [user] = useAuthState(auth)
  const [room, setRoom] = useState<Room | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return
      const roomDoc = await getDoc(doc(db, 'rooms', roomId))
      if (roomDoc.exists()) {
        setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room)
        setGameStarted(roomDoc.data().gameStarted || false)
      }
    }

    fetchRoom()
  }, [roomId])

  const joinRoom = async () => {
    if (!user || !room) return
    await updateDoc(doc(db, 'rooms', room.id), {
      players: arrayUnion(user.uid),
    })
  }

  const handleGameEnd = useCallback(async () => {
    setGameStarted(false)
    if (room) {
      await updateDoc(doc(db, 'rooms', room.id), {
        gameStarted: false,
      })
    }
  }, [room])

  if (!roomId) {
    return <div>Invalid room ID</div>
  }

  if (!user) {
    return <div>Please sign in to join a room.</div>
  }

  if (!room) {
    return <div>Loading room...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Room {room.id}</h1>
          <p className="text-xl text-purple-200 mb-6">Players: {room.players.length}</p>
          {!room.players.includes(user.uid) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={joinRoom}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-bold transition duration-300 mb-8"
            >
              Join Room
            </motion.button>
          )}
          <Game
            gameStarted={gameStarted}
            onGameEndAction={handleGameEnd}
          />
          <Chat roomId={roomId} />
        </div>
      </motion.div>
    </div>
  )
}

