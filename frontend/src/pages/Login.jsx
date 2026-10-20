


// import { useState, useEffect, useRef } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { motion, AnimatePresence } from 'framer-motion';
// import { gsap } from 'gsap';
// import { HiMail, HiLockClosed, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
// import api from '../api/axios';

// const Login = () => {
//   const navigate = useNavigate();
//   const formRef = useRef(null);
//   const bgRef = useRef(null);
//   const blobRef = useRef(null);

//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);

//   // GSAP: Animated Mesh Background & Floating Blobs
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       // Floating blobs animation
//       gsap.to(".blob", {
//         x: "random(-50, 50)",
//         y: "random(-50, 50)",
//         duration: 5,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut",
//         stagger: 0.5
//       });

//       // Subtle background parallax
//       window.addEventListener("mousemove", (e) => {
//         const { clientX, clientY } = e;
//         const xPos = (clientX / window.innerWidth - 0.5) * 20;
//         const yPos = (clientY / window.innerHeight - 0.5) * 20;
//         gsap.to(".bg-visual", { x: xPos, y: yPos, duration: 1, ease: "power2.out" });
//       });
//     });
//     return () => ctx.revert();
//   }, []);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await api.post('/auth/login', formData);
//       if (response.data.success) {
//         toast.success('Welcome back!');
//         navigate('/home');
//       }
//     } catch (error) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       gsap.to(formRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#f8fafc]">
//       {/* BACKGROUND VISUAL LAYER */}
//       <div className="bg-visual absolute inset-0 z-0">
//         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-200/50 to-cyan-200/50 rounded-full blur-[120px]" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-blue-200/50 to-pink-200/50 rounded-full blur-[120px]" />
        
//         {/* GSAP Floating Blobs */}
//         <div className="blob absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
//         <div className="blob absolute bottom-1/3 right-1/4 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl" />
//       </div>

//       <div className="relative z-10 w-full max-w-[1100px] flex flex-col md:flex-row items-center justify-center gap-12 p-6">
        
//         {/* LEFT SIDE: Content/Branding */}
//         <motion.div 
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="hidden md:block w-1/2"
//         >
//           <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white mb-6">
//             <HiShieldCheck className="text-indigo-600" />
//             <span className="text-xs font-bold uppercase tracking-wider text-indigo-900/60">Secure Storage Protocol</span>
//           </div>
//           <h1 className="text-6xl font-black text-slate-900 leading-tight mb-6">
//             Everything you <br /> 
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
//               need to store
//             </span> <br />
//             in one place.
//           </h1>
//           <p className="text-lg text-slate-600 max-w-md leading-relaxed">
//             Experience the next generation of cloud management. Fast, secure, and beautiful.
//           </p>
//         </motion.div>

//         {/* RIGHT SIDE: Login Card */}
//         <motion.div
//           ref={formRef}
//           initial={{ opacity: 0, y: 30, scale: 0.95 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className="w-full max-w-[450px]"
//         >
//           <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 relative overflow-hidden">
            
//             {/* Form Header */}
//             <div className="mb-10 relative">
//               <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
//               <div className="h-1 w-12 bg-indigo-600 rounded-full" />
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5 relative">
//               {/* Email Input */}
//               <div className="group">
//                 <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase tracking-widest">Email Address</label>
//                 <div className="relative">
//                   <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
//                   <input
//                     type="email"
//                     name="email"
//                     required
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="name@company.com"
//                     className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
//                   />
//                 </div>
//               </div>

//               {/* Password Input */}
//               <div className="group">
//                 <div className="flex justify-between mb-2">
//                   <label className="text-xs font-bold text-slate-500 ml-1 block uppercase tracking-widest">Password</label>
//                   <Link to="/forgot-password" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
//                 </div>
//                 <div className="relative">
//                   <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
//                   <input
//                     type="password"
//                     name="password"
//                     required
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="••••••••"
//                     className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300"
//                   />
//                 </div>
//               </div>

//               {/* Submit Button with Shimmer Effect */}
//               <motion.button
//                 whileHover={{ scale: 1.01 }}
//                 whileTap={{ scale: 0.98 }}
//                 disabled={loading}
//                 className="relative w-full mt-4 overflow-hidden rounded-2xl bg-slate-900 py-4 px-8 font-bold text-white shadow-xl shadow-slate-200 transition-all duration-300 disabled:opacity-70"
//               >
//                 <div className="relative z-10 flex items-center justify-center gap-2">
//                   {loading ? (
//                     <div className="flex items-center gap-2">
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       <span>Authenticating...</span>
//                     </div>
//                   ) : (
//                     <>
//                       <span>Sign Into Jotter</span>
//                       <HiArrowRight className="text-lg" />
//                     </>
//                   )}
//                 </div>
//                 {/* Shimmer Effect */}
//                 <motion.div 
//                   initial={{ x: '-100%' }}
//                   animate={{ x: '100%' }}
//                   transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
//                 />
//               </motion.button>
//             </form>

//             {/* Footer */}
//             <div className="mt-10 text-center">
//               <p className="text-slate-500 font-medium">
//                 New here?{' '}
//                 <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold underline decoration-2 underline-offset-4">
//                   Create an account
//                 </Link>
//               </p>
//             </div>
//           </div>

//           {/* Bottom Badge */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1 }}
//             className="flex items-center justify-center gap-4 mt-8"
//           >
//             <div className="h-[1px] w-8 bg-slate-200" />
//             <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Encrypted End-to-End</span>
//             <div className="h-[1px] w-8 bg-slate-200" />
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Login;

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

      // Clean Entrance: fromTo ensures visibility is forced to 1 at the end
      tl.fromTo(brandingRef.current, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1 }
      )
      .fromTo(cardRef.current, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1 }, 
        "-=0.6"
      )
      .fromTo(".reveal-item", 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 }, 
        "-=0.4"
      );

      // Simple parallax for the background glow
      if (isDesktop) {
        window.addEventListener("mousemove", (e) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 40;
          const y = (e.clientY / window.innerHeight - 0.5) * 40;
          gsap.to(".bg-glow", { x, y, duration: 2 });
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
        // Pull the fresh user into the shared auth state so the header
        // avatar/name is correct immediately (not only after a reload).
        await refreshUser();
        toast.success('Access Granted');
        navigate('/home');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      gsap.to(cardRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-[#fffbf7] flex flex-col items-center justify-center p-4 py-12 md:p-8 overflow-y-auto">
      
      {/* --- STABLE BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-glow absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-100/50 rounded-full blur-[100px]" />
        <div className="bg-glow absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        
        {/* --- BRANDING --- */}
        <div ref={brandingRef} className="w-full lg:w-1/2 text-center lg:text-left opacity-0">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-200 px-4 py-1.5 rounded-full mb-6">
            <HiSparkles className="text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900/60">System Protocol Active</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-black text-slate-900 leading-none tracking-tighter mb-6">
            Elevate your <br />
            <span className="text-amber-600 italic font-serif py-1">Digital World.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto lg:mx-0">
            A secure, warm, and responsive environment for your most important assets.
          </p>
        </div>

        {/* --- LOGIN CARD --- */}
        <div ref={cardRef} className="w-full max-w-[450px] opacity-0">
          <div className="bg-white/90 backdrop-blur-2xl border border-amber-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_25px_70px_-15px_rgba(180,83,9,0.1)]">
            
            <div className="reveal-item mb-10">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Login</h2>
              <div className="h-1 w-12 bg-amber-500 rounded-full mt-3" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="reveal-item space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Email</label>
                <div className="relative group">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors text-xl" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@provider.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="reveal-item space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Cipher</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-amber-600 hover:text-amber-700">Forgot?</Link>
                </div>
                <div className="relative group">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors text-xl" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/5 transition-all"
                  />
                </div>
              </div>

              {/* --- SUBMIT BUTTON (High Visibility Fix) --- */}
              <button
                disabled={loading}
                type="submit"
                className="reveal-item relative w-full h-[64px] bg-slate-900 rounded-2xl overflow-hidden transition-all active:scale-[0.98] group shadow-xl shadow-amber-900/10"
              >
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Button Content */}
                <div className="relative z-10 flex items-center justify-center gap-3 text-white font-bold tracking-widest text-sm uppercase">
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

            <div className="reveal-item mt-10 pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-400 text-sm">
                No account yet?{' '}
                <Link to="/signup" className="text-amber-600 font-bold hover:underline decoration-2 underline-offset-4">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          <div className="reveal-item flex items-center justify-center gap-4 mt-8 opacity-40">
            <HiShieldCheck className="text-amber-600 text-xl" />
            <span className="text-[9px] text-slate-900 font-black uppercase tracking-[0.3em]">End-to-End Encrypted Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;