'use client'

import { motion } from 'framer-motion'
import { Question } from '@/lib/gameLogic'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string) => void
}

export default function QuestionComponent({ question, onAnswer }: QuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">{question.text}</h2>
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAnswer(option)}
            className="p-4 bg-gray-200 rounded-lg text-left"
          >
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

