import { motion, AnimatePresence } from 'framer-motion'

export function PromotionModal({ color, onSelect }) {
  const pieces = ['q', 'r', 'b', 'n']

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/80"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-5 text-center">Choose promotion</h3>
          <div className="flex gap-3">
            {pieces.map((p) => (
              <button
                key={p}
                onClick={() => onSelect(p)}
                className="w-16 h-16 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all active:scale-95"
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
