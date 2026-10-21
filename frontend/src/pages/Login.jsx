import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { HiMail, HiLockClosed, HiArrowRight, HiSparkles, HiShieldCheck } from 'react-icons/hi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const brandingRef = useRef(null);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isMobile: "(max-width: 1023px)"
    }, (context) => {
      let { isDesktop } = context.conditions;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(brandingRef.current, 
        { x: -40, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.2 }
      )
      .fromTo(cardRef.current, 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1 }, 
        "-=0.8"
      )
      .fromTo(".reveal-item", 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 }, 
        "-=0.6"
      );

      if (isDesktop) {
        window.addEventListener("mousemove", (e) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 60;
          const y = (e.clientY / window.innerHeight - 0.5) * 60;
          gsap.to(".bg-glow", { x, y, duration: 2, ease: "power2.out" });
        });
      }
    });
  }, { scope: containerRef });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        await refreshUser();
        toast.success('Welcome back! Access Granted');
        navigate('/home');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      gsap.to(cardRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4, ease: "power1.inOut" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#fffbf7] flex flex-col items-center justify-center p-4 py-12 overflow-hidden">
      
      {/* --- DYNAMIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-glow absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-coral/20 rounded-full blur-[120px]" />
        <div className="bg-glow absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-grape/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* --- BRANDING SECTION --- */}
        <div ref={brandingRef} className="w-full lg:w-1/2 text-center lg:text-left opacity-0">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-brand-coral/20 px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <HiSparkles className="text-brand-coral" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-coral/80">Secure Workspace</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-ink-900 leading-[1.1] tracking-tighter mb-6">
            Welcome <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-coral via-brand-tangerine to-brand-sun italic">Back Home.</span>
          </h1>
          <p className="text-ink-500 text-lg md:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
            Step back into your digital sanctuary. Everything is exactly where you left it.
          </p>
        </div>

        {/* --- LOGIN CARD --- */}
        <div ref={cardRef} className="w-full max-w-[480px] opacity-0">
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-warm-xl rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
            {/* Decorative accent for the card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-brand-coral/10" />
            
            <div className="reveal-item mb-10 relative">
              <h2 className="text-3xl font-display font-bold text-ink-900 tracking-tight">Login</h2>
              <div className="h-1.5 w-12 bg-gradient-to-r from-brand-coral to-brand-tangerine rounded-full mt-3" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="reveal-item space-y-2">
                <label className="text-[11px] font-bold text-ink-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 group-focus-within:text-brand-coral transition-colors text-xl" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-white/50 border border-cream-200 rounded-2xl py-4 pl-12 pr-4 text-ink-900 outline-none focus:bg-white focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all placeholder:text-ink-200"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="reveal-item space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-ink-400 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-bold text-brand-coral hover:text-brand-tangerine transition-colors">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 group-focus-within:text-brand-coral transition-colors text-xl" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/50 border border-cream-200 rounded-2xl py-4 pl-12 pr-4 text-ink-900 outline-none focus:bg-white focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all placeholder:text-ink-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={loading}
                type="submit"
                className="reveal-item relative w-full h-[64px] bg-ink-900 rounded-2xl overflow-hidden transition-all active:scale-[0.98] group shadow-lg shadow-ink-900/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-coral via-brand-tangerine to-brand-sun opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-center gap-3 text-white font-bold tracking-wide text-sm uppercase">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Workspace</span>
                      <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="reveal-item mt-10 pt-8 border-t border-cream-100 text-center">
              <p className="text-ink-400 text-sm font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="text-brand-coral font-bold hover:text-brand-tangerine transition-colors underline underline-offset-4 decoration-2">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          <div className="reveal-item flex items-center justify-center gap-3 mt-8 opacity-60">
            <HiShieldCheck className="text-brand-coral text-xl" />
            <span className="text-[10px] text-ink-500 font-bold uppercase tracking-[0.2em]">Bank-grade Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;