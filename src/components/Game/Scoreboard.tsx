'use client'

import { motion } from 'framer-motion'

interface ScoreboardProps {
  scores: Record<string, number>
}

export default function Scoreboard({ scores }: ScoreboardProps) {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Scoreboard</h2>
      <ul>
        {sortedScores.map(([player, score], index) => (
          <motion.li
            key={player}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="mb-2"
          >
            {player}: {score}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

