import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import BottomNav from './BottomNav';
import { cx, EASE } from '../utils/format';

const BLOBS = {
  coral: ['bg-brand-coral/20', 'bg-brand-tangerine/20', 'bg-brand-sun/20'],
  grape: ['bg-brand-grape/18', 'bg-brand-sky/18', 'bg-brand-rose/14'],
  mint: ['bg-brand-mint/20', 'bg-brand-sky/16', 'bg-brand-sun/16'],
  sky: ['bg-brand-sky/20', 'bg-brand-grape/16', 'bg-brand-mint/14'],
  rose: ['bg-brand-rose/18', 'bg-brand-grape/16', 'bg-brand-tangerine/16'],
};

/**
 * PageShell — the warm, animated frame shared by every light page:
 * drifting colour blobs, sticky glass header and the bottom dock.
 */
export default function PageShell({
  title,
  subtitle,
  onSearch,
  showSearch = false,
  accent = 'coral',
  actions,
  back = false,
  hideNav = false,
  maxWidth = 'max-w-6xl',
  onAddClick,
  children,
}) {
  const palette = BLOBS[accent] || BLOBS.coral;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* ---------- warm animated background ---------- */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-cream-50">
        <div className={cx('absolute -left-40 -top-52 h-[36rem] w-[36rem] animate-blob-drift rounded-full blur-[130px]', palette[0])} />
        <div className={cx('absolute -right-44 top-1/4 h-[34rem] w-[34rem] animate-blob-drift-slow rounded-full blur-[130px]', palette[1])} />
        <div className={cx('absolute -bottom-56 left-1/3 h-[30rem] w-[30rem] animate-blob-drift rounded-full blur-[130px]', palette[2])} />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(148,128,102,0.16) 1px, transparent 0)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 70%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream-100/90 to-transparent" />
      </div>

      {/* ---------- top scroll blur band ---------- */}
      <div className={`fixed top-0 left-0 right-0 h-3 z-[50] pointer-events-none ${scrolled ? 'bg-cream-50/80 backdrop-blur-md transition-colors' : 'bg-transparent'}`} />

      <div className="container mx-auto">
        <Header title={title} subtitle={subtitle} onSearch={onSearch} showSearch={showSearch} accent={accent} actions={actions} back={back} />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={cx('relative z-10 mx-auto w-full px-4 pb-32 pt-20 sm:px-6 lg:px-8', maxWidth)}
      >
        <div className="container mx-auto">
          {children}
        </div>
      </motion.main>

      {!hideNav && <BottomNav onAddClick={onAddClick} />}
    </div>
  );
}