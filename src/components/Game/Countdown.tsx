'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CountdownProps {
  duration: number
  onComplete: () => void
}

export default function Countdown({ duration, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      onComplete()
    }
  }, [timeLeft, onComplete])

  return (
    <motion.div
      initial={{ width: '100%' }}
      animate={{ width: `${(timeLeft / duration) * 100}%` }}
      transition={{ duration: 1, ease: 'linear' }}
      className="h-2 bg-blue-500 rounded-full mb-4"
    />
  )
}

