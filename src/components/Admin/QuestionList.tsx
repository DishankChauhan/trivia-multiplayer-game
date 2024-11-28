'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: string
}

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question))
      setQuestions(questionsData)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'questions', id))
        alert('Question deleted successfully!')
      } catch (error) {
        console.error('Error deleting question:', error)
        alert('Error deleting question. Please try again.')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Question List</h2>
      <AnimatePresence>
        {questions.map((question) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-lg shadow-md mb-4"
          >
            <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
            <ul className="list-disc list-inside mb-2">
              {question.options.map((option, index) => (
                <li key={index} className={option === question.correctAnswer ? 'font-bold' : ''}>
                  {option}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleDelete(question.id)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

