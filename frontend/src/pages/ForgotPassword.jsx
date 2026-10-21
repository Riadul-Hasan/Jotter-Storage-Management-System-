import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { HiMail, HiArrowRight, HiShieldCheck, HiKey, HiOutlineSparkles } from 'react-icons/hi';
import api from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const brandingRef = useRef(null);
  
  const purpose = location.state?.purpose === 'vault' ? 'vault' : 'account';
  const isVault = purpose === 'vault';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useGSAP(() => {
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
  }, { scope: containerRef });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email, purpose });

      if (response.data.success) {
        toast.success('Verification code sent to your email');
        navigate('/verify-code', { state: { email, purpose } });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send code';
      toast.error(message);
      gsap.to(cardRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4, ease: "power1.inOut" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#fbfcfb] flex flex-col items-center justify-center p-4 py-12 overflow-hidden">
      
      {/* --- DYNAMIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* --- BRANDING SECTION --- */}
        <div ref={brandingRef} className="w-full lg:w-1/2 text-center lg:text-left opacity-0">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-purple-200 px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <HiOutlineSparkles className="text-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-900/60">Recovery Protocol</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-ink-900 leading-[1.1] tracking-tighter mb-6">
            Restore your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-emerald-500 to-teal-400 italic font-serif">
              Access Keys.
            </span>
          </h1>
          <p className="text-ink-500 text-lg md:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
            {isVault 
              ? "Resetting your vault password requires a verified identity. We'll send a secure code to your email."
              : "Lost your access? No problem. Enter your email and we'll help you get back into your sanctuary."}
          </p>
        </div>

        {/* --- FORGOT PASSWORD CARD --- */}
        <div ref={cardRef} className="w-full max-w-[480px] opacity-0">
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-warm-xl rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/10" />
            
            <div className="reveal-item mb-10 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                  {isVault ? <HiShieldCheck size={24} /> : <HiKey size={24} />}
                </div>
                <h2 className="text-3xl font-display font-bold text-ink-900 tracking-tight">
                  {isVault ? 'Vault Reset' : 'Forgot Password'}
                </h2>
              </div>
              <div className="h-1.5 w-12 bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="reveal-item space-y-2">
                <label className="text-[11px] font-bold text-ink-400 uppercase tracking-widest ml-1">Account Email</label>
                <div className="relative group">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 group-focus-within:text-purple-500 transition-colors text-xl" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white/50 border border-cream-200 rounded-2xl py-4 pl-12 pr-4 text-ink-900 outline-none focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-ink-200"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="reveal-item relative w-full h-[64px] bg-ink-900 rounded-2xl overflow-hidden transition-all active:scale-[0.98] group shadow-lg shadow-ink-900/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex items-center justify-center gap-3 text-white font-bold tracking-wide text-sm uppercase">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Code</span>
                      <HiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="reveal-item mt-10 pt-8 border-t border-cream-100 text-center">
              <p className="text-ink-400 text-sm font-medium">
                Remember your credentials?{' '}
                <Link to="/login" className="text-purple-600 font-bold hover:text-emerald-600 transition-colors underline underline-offset-4 decoration-2">
                  Return to Login
                </Link>
              </p>
            </div>
          </div>

          {isVault && (
            <div className="reveal-item flex items-center justify-center gap-3 mt-8 opacity-60">
              <HiShieldCheck className="text-purple-600 text-xl" />
              <span className="text-[10px] text-ink-500 font-bold uppercase tracking-[0.2em]">Vault Isolation Protocol Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
