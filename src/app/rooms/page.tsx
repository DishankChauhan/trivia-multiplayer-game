'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Room {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  players?: string[] // Added players field to the Room interface
}

export default function RoomsPage() {
  const [user, loading] = useAuthState(auth)
  const [rooms, setRooms] = useState<Room[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, 'rooms'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const roomsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room))
      setRooms(roomsData)
    })

    return () => unsubscribe()
  }, [user])

  const createRoom = async () => {
    if (!user) return
    try {
      const roomName = prompt('Enter room name:')
      if (roomName) {
        const docRef = await addDoc(collection(db, 'rooms'), {
          name: roomName,
          createdBy: user.uid,
          createdAt: new Date(),
          players: [], // Initialize players array when creating a room
        })
        router.push(`/chat/${docRef.id}`)
      }
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Chat Rooms</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-blue-600 transition duration-300"
          >
            Create Room
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-100 p-4 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <p className="text-gray-600 mb-2">Players: {room.players?.length || 0}</p> {/* Updated line */}
              <Link href={`/chat/${room.id}`} className="text-blue-500 hover:underline">
                Join Room
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <Link href="/game" className="inline-flex items-center bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold shadow-md hover:bg-gray-300 transition duration-300">
          <Image src="/images/game-icon.png" alt="Game" width={24} height={24} className="mr-2" />
          Back to Game
        </Link>
      </motion.div>
    </div>
  )
}

