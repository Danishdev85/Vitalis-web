import { motion } from 'framer-motion';
import { FaHeartbeat } from 'react-icons/fa';

/**
 * Branded loading indicator — a pulsing heartbeat icon with an orbiting ring.
 * Use while API calls (departments, doctors, availability, etc.) are in flight.
 *
 * Usage:
 *   {loading ? <LoadingSpinner /> : <ActualContent />}
 *   <LoadingSpinner size="sm" label="Checking availability..." />
 */
export default function LoadingSpinner({ size = 'md', label, fullPage = false }) {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 'text-base', ring: 'border-2' },
    md: { box: 'w-14 h-14', icon: 'text-xl', ring: 'border-[3px]' },
    lg: { box: 'w-20 h-20', icon: 'text-3xl', ring: 'border-4' },
  };
  const s = sizes[size] || sizes.md;

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${s.box} flex items-center justify-center`}>
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 rounded-full ${s.ring} border-skyblue border-t-teal`}
        />
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-teal ${s.icon}`}
        >
          <FaHeartbeat />
        </motion.span>
      </div>

      {label && (
        <span className="text-sm text-deepblue/60 font-medium">{label}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}