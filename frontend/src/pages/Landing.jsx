import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import { 
  FileText, 
  Image as ImageIcon, 
  Shield, 
  Zap, 
  Layout, 
  HardDrive,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  Github,
  Star
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          navigate('/home');
        }
      } catch (error) {}
    };
    checkAuth();
  }, [navigate]);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      title: "Smart Notes",
      description: "Capture your thoughts instantly with our rich text editor. Organize with tags and categories."
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-blue-500" />,
      title: "Media Gallery",
      description: "Upload and preview images seamlessly. Automatic compression and smart organization."
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-emerald-500" />,
      title: "Deep Folders",
      description: "Nest folders as deep as you need. Keep your digital life perfectly structured."
    },
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: "Locked Safety",
      description: "Secure your sensitive information with encrypted folders and password protection."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Lightning Fast",
      description: "Built for speed. Search, move, and access your files in milliseconds."
    },
    {
      icon: <HardDrive className="w-6 h-6 text-cyan-500" />,
      title: "Cloud Sync",
      description: "Access your data from anywhere. Real-time synchronization across all devices."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030014] text-white selection:bg-purple-500/30">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, resize: true },
            modes: { grab: { distance: 140, links: { opacity: 0.5 } } },
          },
          particles: {
            color: { value: "#ffffff" },
            links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1 },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.3 },
            size: { value: { min: 1, max: 3 } },
          },
        }}
        className="absolute inset-0 z-0"
      />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full z-0" />
      
      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center">
            <Layout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white">Jotter</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-white" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
      </nav>

      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          v2.0 is now live with End-to-End Encryption
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Your Digital Life,<br /></span>
          <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Beautifully Organized.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Jotter is the modern workspace where you can store notes, images, and PDFs. 
          Powerful organization meets a clean, distraction-free interface.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Button size="large" className="w-full sm:w-auto px-8" onClick={() => navigate('/signup')} icon={<ArrowRight className="w-5 h-5" />}>Start for free</Button>
          <Button variant="secondary" size="large" className="w-full sm:w-auto px-8 bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => window.open('https://github.com', '_blank')} icon={<Github className="w-5 h-5" />}>View Github</Button>
        </div>
        
        {/* Floating App Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative max-w-5xl mx-auto mb-32">
          <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent z-10 h-[105%]" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm shadow-2xl">
            <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group">
                <div className="relative">
                    <Layout className="w-32 h-32 text-purple-500/20 group-hover:text-purple-500/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="w-12 h-12 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow-xl z-20 animate-float hidden md:block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg"><Star className="text-emerald-500 w-5 h-5" /></div>
              <div className="text-left"><p className="text-white font-bold">4.9/5</p><p className="text-gray-400 text-xs">User Rating</p></div>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} glass className="text-left group hover:border-purple-500/50 transition-colors">
              <div className="mb-4 p-3 bg-white/5 w-fit rounded-xl group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </main>
      
      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">© 2026 Jotter Storage.</p>
        <section className="mt-32 relative py-20 px-8 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 z-0" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Experience the future of organization.</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Join thousands of users who have already simplified their digital storage with Jotter.</p>
            <Button size="large" onClick={() => navigate('/signup')}>Create Your Account Now</Button>
          </div>
        </section>

      </footer>
    </div>
  );
};
export default Landing;
