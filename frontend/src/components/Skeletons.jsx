import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cx, staggerGroup, staggerItem } from '../utils/format';

/** Skeleton rows while a list loads. */
export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3" aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3.5 rounded-3xl border border-cream-200 bg-white/70 p-3.5">
        <div className="w-skeleton h-12 w-12 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="w-skeleton h-3.5 rounded-full" style={{ width: `${55 + ((i * 13) % 30)}%` }} />
          <div className="w-skeleton h-2.5 w-1/3 rounded-full" />
        </div>
        <div className="w-skeleton hidden h-8 w-8 rounded-full sm:block" />
      </div>
    ))}
  </div>
);

/** Skeleton cards while a grid loads. */
export const GridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="w-skeleton aspect-[4/5] rounded-3xl" />
    ))}
  </div>
);

/**
 * EmptyState — friendly, colourful placeholder with optional CTA.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  text = 'When something shows up, it will land right here.',
  action,
  tone = 'coral',
}) => {
  const tones = {
    coral: 'from-brand-coral/20 to-brand-tangerine/20 text-brand-coral',
    grape: 'from-brand-grape/20 to-brand-sky/20 text-brand-grape',
    mint: 'from-brand-mint/20 to-emerald-500/20 text-brand-mint',
    rose: 'from-brand-rose/20 to-pink-500/20 text-brand-rose',
    sky: 'from-brand-sky/20 to-blue-500/20 text-brand-sky',
  };
  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-cream-300 bg-white/60 px-6 py-14 text-center backdrop-blur-sm"
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={cx('grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br shadow-warm-md', tones[tone])}
      >
        <Icon size={34} strokeWidth={2} />
      </motion.span>
      <h3 className="w-title mt-5 text-lg text-ink-900">{title}</h3>
      <p className="w-sub mt-1.5 max-w-sm">{text}</p>
      {action}
    </motion.div>
  );
};

/** Staggered wrapper for grids/lists of motion children. */
export const Stagger = ({ children, className, as = 'div' }) => {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag variants={staggerGroup} initial="hidden" animate="visible" className={className}>
      {children}
    </MotionTag>
  );
};

export default EmptyState;