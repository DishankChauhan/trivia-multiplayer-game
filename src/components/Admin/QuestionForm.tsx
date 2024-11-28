'use client'

import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { motion } from 'framer-motion'

export default function QuestionForm() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'questions'), {
        text: question,
        options,
        correctAnswer,
        createdAt: new Date(),
      })
      // Reset form
      setQuestion('')
      setOptions(['', '', '', ''])
      setCorrectAnswer('')
      alert('Question added successfully!')
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Error adding question. Please try again.')
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <div className="mb-4">
        <label htmlFor="question" className="block mb-2">
          Question:
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      {options.map((option, index) => (
        <div key={index} className="mb-4">
          <label htmlFor={`option${index + 1}`} className="block mb-2">
            Option {index + 1}:
          </label>
          <input
            type="text"
            id={`option${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      ))}
      <div className="mb-4">
        <label htmlFor="correctAnswer" className="block mb-2">
          Correct Answer:
        </label>
        <select
          id="correctAnswer"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select correct answer</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Question
      </motion.button>
    </motion.form>
  )
}

