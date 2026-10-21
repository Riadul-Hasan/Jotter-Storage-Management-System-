import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Particles } from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import {
  Feather,
  ArrowRight,
  Shield,
  Sparkles,
  Layers,
  Lock,
  Zap,
  Heart,
  Star,
  NotebookPen,
  Image as ImageIcon,
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) navigate('/home');
      } catch (error) {}
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      setMouse({ x: (e.clientX / w - 0.5) * 2, y: (e.clientY / h - 0.5) * 2 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const bigLetters = 'VAULT'.split('');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#fff7f2] text-ink-900 selection:bg-brand-rose/30 flex flex-col">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: 'transparent' } },
          fpsLimit: 120,
          interactivity: {
            events: { onHover: { enable: true, mode: 'grab' }, resize: true },
            modes: { grab: { distance: 140, links: { opacity: 0.4 } } },
          },
          particles: {
            color: { value: ['#FF6B5B', '#F43F5E', '#FF9F1C', '#8B5CF6'] },
            links: { color: '#F43F5E', distance: 130, enable: true, opacity: 0.12, width: 1 },
            move: { enable: true, speed: 0.55 },
            number: { density: { enable: true, area: 900 }, value: 46 },
            opacity: { value: 0.35 },
            size: { value: { min: 1, max: 3 } },
          },
        }}
        className="absolute inset-0 z-0"
      />

      <AnimatePresence mode="wait">
        {!ready && (
          <motion.div
            key="cinematic-splash"
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(20px)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#fff7f2]"
          >
            {/* Animated gradient mesh */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 15% 25%, rgba(244,63,94,0.35), transparent 55%), radial-gradient(circle at 85% 75%, rgba(255,107,91,0.3), transparent 55%), radial-gradient(circle at 50% 50%, rgba(250,204,21,0.18), transparent 60%)',
                  'radial-gradient(circle at 80% 20%, rgba(244,63,94,0.35), transparent 55%), radial-gradient(circle at 20% 80%, rgba(255,107,91,0.3), transparent 55%), radial-gradient(circle at 50% 50%, rgba(250,204,21,0.18), transparent 60%)',
                  'radial-gradient(circle at 15% 25%, rgba(244,63,94,0.35), transparent 55%), radial-gradient(circle at 85% 75%, rgba(255,107,91,0.3), transparent 55%), radial-gradient(circle at 50% 50%, rgba(250,204,21,0.18), transparent 60%)',
                ],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0"
            />

            {/* Mouse glow */}
            <motion.div
              animate={{ x: mouse.x * 70, y: mouse.y * 70 }}
              transition={{ type: 'spring', stiffness: 50, damping: 18 }}
              className="absolute w-[460px] h-[460px] rounded-full bg-gradient-to-br from-brand-rose/30 to-brand-coral/20 blur-[100px] pointer-events-none"
            />

            {/* Rings */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={`ring-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 2.6], opacity: [0.55, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
                className="absolute w-44 h-44 rounded-full border-2 border-brand-rose/40"
              />
            ))}

            {/* Floating icons */}
            {[
              { Icon: NotebookPen, x: -290, y: -130, delay: 0.2, color: 'text-brand-rose' },
              { Icon: ImageIcon, x: 310, y: -110, delay: 0.4, color: 'text-brand-coral' },
              { Icon: Shield, x: -260, y: 150, delay: 0.6, color: 'text-brand-mint' },
              { Icon: Layers, x: 280, y: 170, delay: 0.8, color: 'text-brand-grape' },
              { Icon: Zap, x: 0, y: -210, delay: 1.0, color: 'text-brand-sun' },
            ].map(({ Icon, x, y, delay, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: x * 0.4, y: y * 0.4 }}
                animate={{ opacity: [0, 1, 1, 0.7], scale: 1, x: [x * 0.4, x, x * 1.04, x], y: [y * 0.4, y, y * 1.04, y] }}
                transition={{ duration: 2.6, delay, ease: 'easeOut' }}
                className={`absolute ${color}`}
                style={{ left: '50%', top: '50%', marginLeft: -16, marginTop: -16 }}
              >
                <Icon className="w-8 h-8" strokeWidth={2} />
              </motion.div>
            ))}

            {/* Swift welcome text */}
            <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
              <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base font-bold uppercase tracking-[0.35em] text-brand-rose"
              >
                Step into your
              </motion.p>
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                {bigLetters.map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 80, rotateX: -90, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.09, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-7xl sm:text-8xl lg:text-9xl font-black bg-gradient-to-br from-brand-rose via-brand-coral to-brand-tangerine bg-clip-text text-transparent drop-shadow-sm"
                    style={{ display: 'inline-block' }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.7 }}
                className="text-base sm:text-lg font-semibold text-ink-700 max-w-md"
              >
                where your ideas live warm & safe
              </motion.p>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                transition={{ delay: 2.0, duration: 1.0, ease: 'circOut' }}
                className="h-1.5 rounded-full bg-gradient-to-r from-brand-rose via-brand-coral to-brand-tangerine mt-2"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-brand-rose/20 blur-[140px] animate-blob-drift" />
      <div className="pointer-events-none absolute bottom-0 -left-40 w-[480px] h-[480px] rounded-full bg-brand-coral/15 blur-[140px] animate-blob-drift-slow" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-brand-tangerine/10 blur-[120px] animate-pulse-slow" />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={ready ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-rose to-brand-coral flex items-center justify-center shadow-warm-glow group-hover:scale-110 transition-transform duration-300">
            <Feather className="text-white w-6 h-6" strokeWidth={2.2} />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter text-ink-900">Jotter</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 12 }} animate={ready ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-3 sm:gap-6">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors px-2 py-1">Sign In</button>
          <button onClick={() => navigate('/signup')} className="rounded-full px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-rose to-brand-coral shadow-warm-glow hover:shadow-warm-md hover:-translate-y-0.5 transition-all duration-300">Get Started</button>
        </motion.div>
      </nav>

      {/* Hero — reduced left content, more visual */}
      <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-5 gap-10 items-center w-full">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-cream-300 text-xs font-bold text-ink-700 shadow-warm-xs backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-brand-rose" /> Warm, private, yours
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mt-6 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink-900">
              Your ideas,
              <span className="block bg-gradient-to-r from-brand-rose via-brand-coral to-brand-tangerine bg-clip-text text-transparent">warmly kept.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-5 text-base sm:text-lg text-ink-600 max-w-md leading-relaxed">
              Notes, images, folders — and a private vault locked by your own password.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/signup')} className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-brand-rose to-brand-coral shadow-warm-glow hover:shadow-warm-md hover:-translate-y-0.5 transition-all duration-300">Start for free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
              <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-ink-800 bg-white border border-cream-300 shadow-warm-xs hover:bg-cream-100 hover:-translate-y-0.5 transition-all duration-300">I have an account</button>
            </motion.div>
          </div>

          {/* Animated visual stage */}
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-3 relative">
            <div className="relative h-[420px] sm:h-[480px]">
              {/* floating note cards */}
              {[
                { rotate: -8, x: 40, y: 60, delay: 0.6, color: 'from-brand-rose/10 to-brand-coral/5', icon: Feather },
                { rotate: 6, x: 120, y: 30, delay: 0.75, color: 'from-brand-tangerine/10 to-brand-sun/5', icon: Sparkles },
                { rotate: -4, x: 200, y: 80, delay: 0.9, color: 'from-brand-grape/10 to-brand-sky/5', icon: Lock },
                { rotate: 9, x: 80, y: 180, delay: 1.05, color: 'from-brand-mint/10 to-brand-sky/5', icon: Layers },
              ].map(({ rotate, x, y, delay, color, icon: Icon }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.7, rotate: rotate - 10, y: y + 40 }}
                  animate={ready ? { opacity: 1, scale: 1, rotate, x, y } : {}}
                  transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.05, rotate: rotate + 2, y: y - 6 }}
                  className={`absolute w-44 h-56 rounded-3xl bg-gradient-to-br ${color} border border-cream-300 backdrop-blur-xl shadow-warm-md flex flex-col p-5`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-warm-xs flex items-center justify-center"><Icon className="w-5 h-5 text-brand-rose" /></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-3/4 rounded-full bg-ink-900/10" />
                    <div className="h-2.5 w-full rounded-full bg-ink-900/10" />
                    <div className="h-2.5 w-2/3 rounded-full bg-ink-900/10" />
                    <div className="h-2.5 w-5/6 rounded-full bg-ink-900/10" />
                  </div>
                </motion.div>
              ))}
              {/* central glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-rose/15 blur-[100px] rounded-full pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-50 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink-400">
          <p className="flex items-center gap-1.5">© 2026 Jotter <Heart className="w-3 h-3 text-brand-rose" /></p>
          <div className="flex gap-6"><a href="#" className="hover:text-ink-700 transition-colors">Privacy</a><a href="#" className="hover:text-ink-700 transition-colors">Terms</a><a href="#" className="hover:text-ink-700 transition-colors">Docs</a></div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
