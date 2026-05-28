import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AitherLogo } from './AitherLogo';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-white px-4 py-12">
      {/* Immersive Dark Forest Green Background with Subtle Image Backdrop */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2518]/70 via-[#07130c]/50 to-[#030906]/80 backdrop-blur-[3px]"></div>
      </div>

      {/* Centered Glassmorphic Login Casing */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Animated Custom Gilded Astrolabe / Compass App Logo */}
        <div className="mb-6">
          <AitherLogo className="w-32 h-32" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">
            {isLogin ? 'Sign In to Aither' : 'Create an Account'}
          </h2>
          <p className="text-white/60 text-xs md:text-sm font-light max-w-xs mx-auto">
            {isLogin ? 'Unlock your personalized portal through space and time.' : 'Start your historical adventures with premium safe paths.'}
          </p>
        </div>

        {error && (
          <div className="w-full mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-xs font-semibold backdrop-blur-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] focus:bg-white/10 outline-none transition-all text-sm text-white placeholder-white/30"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] focus:bg-white/10 outline-none transition-all text-sm text-white placeholder-white/30"
              placeholder="Email Address"
              required
            />
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] focus:bg-white/10 outline-none transition-all text-sm text-white placeholder-white/30"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFCC00] hover:bg-yellow-400 text-black font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-yellow-500/15 disabled:opacity-50 mt-4 text-xs md:text-sm tracking-wide select-none"
          >
            {isLoading ? 'Processing Access...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5 w-full">
          <p className="text-white/45 mb-2 font-light text-xs">
            {isLogin ? "Don't have an account yet?" : 'Already registered with us?'}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#FFCC00] font-bold text-xs hover:text-white transition-colors"
          >
            {isLogin ? 'Create an Account' : 'Sign In Instead'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
