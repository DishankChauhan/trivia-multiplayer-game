'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  text: string
  userId: string
  username: string
  createdAt: Date
}

interface ChatProps {
  roomId: string
}

export default function Chat({ roomId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/send-sound.mp3')
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(fetchedMessages.reverse())
      if (audioRef.current) {
        audioRef.current.play()
      }
    })

    return () => unsubscribe()
  }, [roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !auth.currentUser) return

    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: newMessage,
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: new Date(),
      })
      setNewMessage('')
      if (audioRef.current) {
        audioRef.current.play()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-600">Chat Room</h2>
        <button
          onClick={() => router.push('/rooms')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold hover:bg-gray-300 transition duration-300"
        >
          Back to Rooms
        </button>
      </div>
      <div className="h-64 overflow-y-auto mb-4 p-2 border rounded">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold text-blue-500">{message.username}: </span>
            <span className="text-gray-700">{message.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r font-bold hover:bg-blue-600 transition duration-300"
        >
          Send
        </motion.button>
      </form>
    </motion.div>
  )
}

