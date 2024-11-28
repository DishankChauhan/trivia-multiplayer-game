'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { doc, onSnapshot } from 'firebase/firestore'
import Image from 'next/image'

export default function Navbar() {
  const [user] = useAuthState(auth)
  const [highestScore, setHighestScore] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setHighestScore(doc.data().highestScore || 0)
        } else {
          setHighestScore(0)
        }
      })

      return () => unsubscribe()
    } else {
      setHighestScore(null)
    }
  }, [user])

  // Only render the navbar if user is authenticated
  if (!user) {
    return null
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-blue-500 p-4"
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/images/trivia-logo.png" alt="Trivia Game Logo" width={40} height={40} className="mr-2" />
          <span className="text-white text-2xl font-bold">Trivia Game</span>
        </div>
        <div className="flex items-center">
          {highestScore !== null && (
            <span className="text-white mr-4">Highest Score: {highestScore}</span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => auth.signOut()}
            className="bg-white text-blue-500 px-4 py-2 rounded"
          >
            Sign Out
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}

