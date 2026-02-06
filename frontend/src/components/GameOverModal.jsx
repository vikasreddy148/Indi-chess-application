import { Button } from './Button.jsx'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function GameOverModal({ winner, reason, onRestart }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        >
          <div className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {winner === 'Draw' ? 'Game Drawn' : `${winner} Wins`}
              </h2>
              <p className="text-slate-500 mt-1">{reason}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="primary" size="lg" className="w-full" onClick={onRestart}>
                Play Again
              </Button>
              <Link to="/" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
