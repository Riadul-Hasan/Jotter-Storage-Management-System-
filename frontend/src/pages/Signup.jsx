
// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import api from '../api/axios';

// const Signup = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeTerms: false
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.agreeTerms) {
//       toast.error('Please agree to the terms and conditions');
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await api.post('/auth/signup', {
//         username: formData.username,
//         email: formData.email,
//         password: formData.password,
//         confirmPassword: formData.confirmPassword
//       });

//       if (response.data.success) {
//         toast.success('Account created successfully! Please login.');
//         navigate('/login');
//       }
//     } catch (error) {
//       const message = error.response?.data?.message || 'Signup failed';
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
//         <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
//         <p className="text-gray-600 text-center mb-6">Join Jotter today</p>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Username
//             </label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your username"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your email"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength={6}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter your password"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               minLength={6}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Confirm your password"
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="agreeTerms"
//               checked={formData.agreeTerms}
//               onChange={handleChange}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//             <label className="ml-2 block text-sm text-gray-700">
//               I agree to the{' '}
//               <Link to="/terms" className="text-blue-600 hover:underline">
//                 Terms and Conditions
//               </Link>
//             </label>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
//           >
//             {loading ? 'Creating Account...' : 'Sign Up'}
//           </button>
//         </form>

//         <p className="text-center text-gray-600 mt-6">
//           Already have an account?{' '}
//           <Link to="/login" className="text-blue-600 hover:underline font-medium">
//             Sign In
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  HiUser, HiMail, HiLockClosed, HiCheckCircle, 
  HiArrowRight, HiShieldCheck, HiOutlineSparkles 
} from 'react-icons/hi';
import api from '../api/axios';

const Signup = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const brandingRef = useRef(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);

  useGSAP(() => {
    // FAILSAFE: Ensure elements are visible if GSAP takes a moment to initialize
    gsap.set(".reveal-node", { opacity: 1, visibility: "visible" });

    const mm = gsap.matchMedia();
    mm.add({
      isDesktop: "(min-width: 1024px)",
      isMobile: "(max-width: 1023px)"
    }, (context) => {
      let { isDesktop } = context.conditions;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Cinematic Entrance using fromTo (End state is explicitly opacity: 1)
      tl.fromTo(".bg-aura", 
        { opacity: 0, scale: 1.4 }, 
        { opacity: 0.4, scale: 1, duration: 2, stagger: 0.3 }
      )
      .fromTo(brandingRef.current, 
        { y: isDesktop ? 0 : -20, x: isDesktop ? -40 : 0, opacity: 0 },
        { y: 0, x: 0, opacity: 1, duration: 1 }, "-=1.5"
      )
      .fromTo(cardRef.current, 
        { y: isDesktop ? 0 : 30, x: isDesktop ? 40 : 0, opacity: 0 },
        { y: 0, x: 0, opacity: 1, duration: 1 }, "-=1.2"
      )
      .fromTo(".reveal-node", 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.8 }, "-=0.8"
      );

      if (isDesktop) {
        const handleMove = (e) => {
          const { clientX, clientY } = e;
          const x = (clientX / window.innerWidth - 0.5) * 10;
          const y = (clientY / window.innerHeight - 0.5) * -10;
          gsap.to(cardRef.current, { 
            rotationY: x, 
            rotationX: y, 
            transformPerspective: 1000, 
            duration: 0.6 
          });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
      }
    });
  }, { scope: containerRef });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) return toast.error('Please accept the terms');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords mismatch');

    setLoading(true);
    try {
      const response = await api.post('/auth/signup', formData);
      if (response.data.success) {
        toast.success('Identity Created Successfully!');
        navigate('/login');
      }
    } catch (error) {
      const message = error.response?.data?.message || 
                     (error.response?.data?.errors?.[0]?.msg) || 
                     'Signup failed';
      toast.error(message);
      gsap.to(cardRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Added overflow-y-auto to ensure button is reachable on all mobile screens
    <div ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center bg-[#fffbf2] overflow-x-hidden overflow-y-auto p-4 sm:p-10 selection:bg-orange-100">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="bg-aura absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-orange-200/40 rounded-full blur-[120px]" />
        <div className="bg-aura absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-rose-200/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* --- BRANDING SECTION --- */}
        <div ref={brandingRef} className="w-full lg:w-1/2 text-center lg:text-left opacity-0">
          <div className="reveal-node inline-flex items-center gap-2 bg-orange-100/50 border border-orange-200 px-4 py-2 rounded-full mb-6 lg:mb-10 shadow-sm">
            <HiOutlineSparkles className="text-orange-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-900/60 font-sans">Legacy System V2</span>
          </div>

          <h1 className="reveal-node text-5xl sm:text-6xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tighter mb-6 lg:mb-10">
            Define your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 italic font-serif py-2">
              Digital Legacy.
            </span>
          </h1>
          <p className="reveal-node text-lg sm:text-xl text-slate-600/80 max-w-md mx-auto lg:mx-0 font-light leading-relaxed">
            Your secure sanctuary for thoughts and files. Experience storage that feels like art.
          </p>
        </div>

        {/* --- SIGNUP CARD --- */}
        <div ref={cardRef} className="w-full max-w-[500px] mb-10 lg:mb-0 opacity-0">
          <div className="relative bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-14 shadow-[0_32px_100px_-20px_rgba(180,83,9,0.15)]">
            
            <div className="reveal-node mb-10">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-slate-500 mt-2 font-medium">Initialize your private storage node</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="reveal-node space-y-4">
                {/* Inputs */}
                {['username', 'email'].map((field) => (
                  <div key={field} className="group relative">
                    {field === 'username' ? <HiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-20" /> 
                    : <HiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-20" />}
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      required
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      className="w-full bg-white/60 border border-orange-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 shadow-sm"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group relative">
                    <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-20" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Cipher"
                      className="w-full bg-white/60 border border-orange-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-sm"
                    />
                  </div>
                  <div className="group relative">
                    <HiCheckCircle className={`absolute left-5 top-1/2 -translate-y-1/2 z-20 transition-colors ${formData.password && formData.password === formData.confirmPassword ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Verify"
                      className="w-full bg-white/60 border border-orange-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 outline-none focus:bg-white focus:border-orange-400 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="reveal-node flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-6 h-6 rounded-lg border-orange-200 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-500 font-medium">
                  I accept the <Link to="/terms" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">Storage Covenant</Link>
                </label>
              </div>

              {/* --- THE BUTTON (Ensured Visibility) --- */}
              <button
                disabled={loading}
                type="submit"
                className="reveal-node relative isolate w-full group overflow-hidden h-[72px] bg-slate-900 rounded-2xl shadow-xl shadow-orange-900/10 active:scale-[0.97] transition-all duration-300 disabled:opacity-50"
              >
                {/* Background Hover Gradient */}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-orange-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content with high z-index */}
                <div className="relative z-10 flex items-center justify-center gap-3 font-bold text-white tracking-widest text-sm uppercase">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <HiArrowRight className="text-xl group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="reveal-node mt-10 pt-8 border-t border-orange-50 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Already part of the collective?{' '}
                <Link to="/login" className="text-orange-600 font-black hover:text-rose-600 transition-colors underline decoration-2 underline-offset-8 decoration-orange-200">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="reveal-node flex items-center justify-center gap-6 mt-12 opacity-30">
            <HiShieldCheck className="text-orange-600 text-xl" />
            <span className="text-[10px] text-slate-900 font-black uppercase tracking-[0.4em]">End-to-End Encrypted Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;