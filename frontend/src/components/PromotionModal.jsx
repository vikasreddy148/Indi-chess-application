import { motion, AnimatePresence } from 'framer-motion'

export function PromotionModal({ color, onSelect }) {
  const pieces = ['q', 'r', 'b', 'n']
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-6 text-center">Choose Promotion</h3>
          <div className="flex gap-4">
            {pieces.map((p) => (
              <button
                key={p}
                onClick={() => onSelect(p)}
                className="w-16 h-16 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600 hover:border-emerald-500/50"
              >
                <img
                  src={`https://github.com/lichess-org/lila/raw/master/public/piece/cburnett/${color}${p.toUpperCase()}.svg`}
                  alt={p}
                  className="w-12 h-12"
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
