'use client'

import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      router.push('/game')
    } catch (error: unknown) {
      console.error('Error signing in with Google', error)
      setError(error instanceof Error ? error.message : 'An error occurred during sign in')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white bg-opacity-90 p-8 rounded-lg shadow-xl text-center"
    >
      <Image src="/images/trivia-logo.png" alt="Trivia Game Logo" width={200} height={200} className="mb-6 mx-auto" />
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Welcome to Trivia Master</h1>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={signInWithGoogle}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-blue-600 transition duration-300"
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </motion.button>
      {error && (
        <p className="mt-4 text-red-500">{error}</p>
      )}
    </motion.div>
  )
}

