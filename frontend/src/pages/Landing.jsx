import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          navigate('/home');
        }
      } catch (error) {
        // Not authenticated, stay on landing
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Jotter</h1>
          <p className="text-gray-600 text-lg">Your personal storage solution</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg mb-6">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">Organize Everything</h2>
          <p className="text-gray-600 text-sm">
            Store notes, images, PDFs, and organize them in folders - all in one place
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/signup')}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Get Started
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white border-2 border-gray-200 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Sign In
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          15GB of free storage included
        </p>
      </div>
    </div>
  );
};

export default Landing;