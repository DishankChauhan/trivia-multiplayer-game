'use client'

import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { motion } from 'framer-motion'
import QuestionForm from '@/components/Admin/QuestionForm'
import QuestionList from '@/components/Admin/QuestionList'

export default function AdminPanel() {
  const [user] = useAuthState(auth)
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add')

  if (!user) {
    return <div>Please sign in to access the admin panel.</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto mt-8 p-4"
    >
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab('add')}
          className={`mr-2 px-4 py-2 rounded ${
            activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Add Question
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded ${
            activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Question List
        </button>
      </div>
      {activeTab === 'add' ? <QuestionForm /> : <QuestionList />}
    </motion.div>
  )
}

