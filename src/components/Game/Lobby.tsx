'use client'

import { motion } from 'framer-motion'

interface LobbyProps {
  players: string[]
  onStart: () => void
}

export default function Lobby({ players, onStart }: LobbyProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Waiting for players...</h2>
      <ul className="mb-4">
        {players.map(player => (
          <li key={player} className="mb-2">{player}</li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Game
      </motion.button>
    </motion.div>
  )
}

