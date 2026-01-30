
import React, { useState, useEffect } from 'react';
import { User } from './types';
import AuthPage from './components/AuthPage';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('nova_chat_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('nova_chat_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nova_chat_user');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300">
      {user ? (
        <ChatInterface user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
