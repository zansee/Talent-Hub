import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * BottomSheet — iOS-style sliding bottom sheet for mobile
 * Props: isOpen, onClose, title, children, snapHeight ('half' | 'full' | 'auto')
 */
export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  snapHeight = 'auto',
}) => {
  const heightClass = {
    half: 'max-h-[55%]',
    full: 'max-h-[90%]',
    auto: 'max-h-[80%]',
  }[snapHeight] || 'max-h-[80%]';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={`relative w-full bg-[#1a1f14] border-t border-zinc-800 rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col ${heightClass}`}
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center py-3 shrink-0 cursor-pointer"
              onClick={onClose}
            >
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Title Row */}
            {title && (
              <div className="flex items-center justify-between px-6 pb-3 shrink-0 border-b border-zinc-800/50">
                <h3 className="font-display font-bold text-sm text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="overflow-y-auto no-scrollbar flex-1 px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
