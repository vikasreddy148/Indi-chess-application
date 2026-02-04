import { Button } from './Button.jsx'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export function GameOverModal({ winner, reason, onRestart }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {winner === 'Draw' ? 'Game Drawn!' : `${winner} Wins!`}
              </h2>
              <p className="text-slate-400 text-lg">
                by {reason}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="primary"
                className="w-full py-3 text-lg font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                onClick={onRestart}
              >
                Play Again
              </Button>
              
              <Link to="/" className="w-full">
                <Button
                  variant="secondary"
                  className="w-full py-3 text-lg font-medium rounded-xl border border-slate-600 hover:bg-slate-700 text-slate-300"
                >
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
