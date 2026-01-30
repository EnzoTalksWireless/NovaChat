
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User } from '../types';
import { MOCK_USER } from '../constants';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const x = (e.clientX - window.innerWidth / 2) / 30;
        const y = (e.clientY - window.innerHeight / 2) / 30;
        
        container.style.setProperty('--mx', `${x}px`);
        container.style.setProperty('--my', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleGoogleLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onLogin(MOCK_USER);
      setIsAuthenticating(false);
    }, 1200);
  };

  // Memoize floating elements for performance
  const floatingElements = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.random() * 150 + 100,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * -20}s`,
    duration: `${Math.random() * 15 + 15}s`,
    opacity: Math.random() * 0.15 + 0.05,
    speed: Math.random() * 0.6 + 0.4
  })), []);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 overflow-hidden bg-[#f0f2f5] [--mx:0px] [--my:0px]"
    >
      {/* Optimized Anti-Gravity Background Elements for Light Mode */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute rounded-full blur-[100px] bg-indigo-400/20 will-change-transform"
            style={{
              width: el.size,
              height: el.size,
              left: el.left,
              top: el.top,
              opacity: el.opacity,
              animation: `float ${el.duration} ease-in-out infinite alternate ${el.delay}`,
              transform: `translate3d(calc(var(--mx) * ${el.speed}), calc(var(--my) * ${el.speed}), 0)`,
              transition: 'transform 0.8s cubic-bezier(0.1, 0, 0.2, 1)',
            }}
          />
        ))}
        {/* Soft radial overlay to focus center */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-white/40" />
      </div>

      {/* Main Login Card - Light Theme */}
      <div 
        className="relative z-10 w-full max-w-[420px] will-change-transform px-2 sm:px-0"
        style={{
          transform: `perspective(1200px) rotateX(calc(var(--my) * -0.05deg)) rotateY(calc(var(--mx) * 0.05deg))`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-white/40 flex flex-col items-center relative overflow-hidden group">
          
          {/* Logo / Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl mb-8 flex items-center justify-center shadow-xl shadow-indigo-500/20 transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">NovaChat</h1>
          <p className="text-slate-500 text-center text-lg mb-12 font-medium">
            Sign in to start chatting with me
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.02)] border border-slate-100 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 relative z-10"
          >
            {isAuthenticating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600">Connecting...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-base">Sign in with Google</span>
              </>
            )}
          </button>

          {/* Footer of card */}
          <div className="w-full mt-16 pt-10 border-t border-slate-100 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mb-8">
              SECURE CONNECTION ENABLED
            </span>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center hover:bg-indigo-100 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center hover:bg-indigo-100 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Brand Footer */}
      <footer className="mt-auto mb-10 md:mb-12 z-10 text-slate-400 text-sm font-medium">
        Built with <span className="text-red-400/80 mx-0.5">❤️</span> for <span className="text-slate-500/80">Reckit Labs</span>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, -50px, 0); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
