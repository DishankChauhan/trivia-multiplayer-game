import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchQuestions, FormattedQuestion } from '@/services/question-service'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

const questionVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
}

const optionVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

interface GameProps {
  gameStarted: boolean
  onGameEndAction: () => Promise<void>
}

type Option = string | number | boolean | null

export default function Game({ gameStarted, onGameEndAction }: GameProps) {
  const [user] = useAuthState(auth)
  const [questions, setQuestions] = useState<FormattedQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [highestScore, setHighestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)

  const audioContext = useRef<AudioContext | null>(null)
  const correctSound = useRef<AudioBuffer | null>(null)
  const incorrectSound = useRef<AudioBuffer | null>(null)
  const gameOverSound = useRef<AudioBuffer | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const playSound = useCallback((sound: AudioBuffer) => {
    if (audioContext.current) {
      const source = audioContext.current.createBufferSource()
      source.buffer = sound
      source.connect(audioContext.current.destination)
      source.start()
    }
  }, [])

  const endGame = useCallback(async (finalScore: number) => {
    setGameOver(true)
    if (gameOverSound.current) playSound(gameOverSound.current)
    if (user && finalScore > highestScore) {
      setHighestScore(finalScore)
      const userRef = doc(db, 'users', user.uid)
      try {
        await setDoc(userRef, { highestScore: finalScore }, { merge: true })
      } catch (error) {
        console.error('Error updating highest score:', error)
      }
    }
    await onGameEndAction()
  }, [highestScore, onGameEndAction, user, playSound])

  useEffect(() => {
    const loadSounds = async () => {
      audioContext.current = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
      
      const loadSound = async (url: string) => {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        return await audioContext.current!.decodeAudioData(arrayBuffer)
      }

      correctSound.current = await loadSound('/sounds/correct.mp3')
      incorrectSound.current = await loadSound('/sounds/incorrect.mp3')
      gameOverSound.current = await loadSound('/sounds/game-over.mp3')
    }

    loadSounds()

    return () => {
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const fetchHighestScore = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setHighestScore(userDoc.data().highestScore || 0)
        }
      }
    }
    fetchHighestScore()
  }, [user])

  useEffect(() => {
    if (gameStarted) {
      const loadQuestions = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const fetchedQuestions = await fetchQuestions()
          setQuestions(fetchedQuestions)
          setCurrentQuestionIndex(0)
          setScore(0)
          setGameOver(false)
          setTimeLeft(10)
          setIsLoading(false)
        } catch (error) {
          console.error('Error loading questions:', error)
          setError('Failed to fetch questions. Please try again later.')
          setIsLoading(false)
        }
      }
      loadQuestions()
    }
  }, [gameStarted])

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prevTime: number) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && !gameOver) {
      endGame(score)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [gameStarted, gameOver, timeLeft, score, endGame])

  const handleAnswer = useCallback(async (answer: Option) => {
    if (gameOver || currentQuestionIndex >= questions.length) return

    const currentQuestion = questions[currentQuestionIndex]
    if (answer === currentQuestion.correctAnswer) {
      if (correctSound.current) playSound(correctSound.current)
      setScore((prevScore: number) => prevScore + 1)
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prevIndex: number) => prevIndex + 1)
        setTimeLeft(10)
      } else {
        await endGame(score + 1)
      }
    } else {
      if (incorrectSound.current) playSound(incorrectSound.current)
      await endGame(score)
    }
  }, [currentQuestionIndex, gameOver, questions, score, playSound, endGame])

  if (!gameStarted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Trivia Master!</h2>
        <p className="mb-4">Click the &quot;Play Game&quot; button above to start a new game.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full font-bold"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-4">Your final score: {score}</p>
        <p className="text-xl mb-4">Your highest score: {highestScore}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold"
        >
          Play Again
        </motion.button>
      </motion.div>
    )
  }

  const currentQuestion =
  questions.length > currentQuestionIndex
    ? questions[currentQuestionIndex]
    : null;

if (!currentQuestion) {
  return (
    <div className="text-center">
      <p>No question found or loading...</p>
    </div>
  );
}

return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center min-h-[60vh]"
  >
    <div className="mb-4 text-2xl font-bold">Time left: {timeLeft} seconds</div>
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.id}
        variants={questionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4">Question {currentQuestionIndex + 1} of {questions.length}</h2>
        <p className="text-xl mb-2">Category: {currentQuestion.category}</p>
        <p className="text-2xl mb-6">{currentQuestion.text}</p>
      </motion.div>
    </AnimatePresence>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {currentQuestion.options?.map((option, index) => (
        <motion.button
          key={`${currentQuestion.id}-${index}`}
          variants={optionVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          transition={{ duration: 0.2, delay: index * 0.1 }}
          onClick={() => handleAnswer(option)}
          className="p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 text-left text-lg"
        >
          {option}
        </motion.button>
      ))}
    </div>
  </motion.div>
)}
