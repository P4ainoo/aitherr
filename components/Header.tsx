
import React from 'react';
import { AitherLogo } from './AitherLogo';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AitherLogo className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-white tracking-wide font-sans">
            Aither
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Dummy Profile Avatar Icon */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center border border-white/20 cursor-pointer">
              <svg className="w-5 h-5 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.67-5.33-4-8-4z" />
              </svg>
            </div>
            
            {/* Logout Arrow Icon */}
            <button
              onClick={() => logout()}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center border border-white/10 text-white/80 hover:text-white"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
