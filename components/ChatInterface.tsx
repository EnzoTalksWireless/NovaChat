
import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import { sendMessageToWebhook } from '../services/webhookService';

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Asalam o Alayikum!! Main aap ki kia help kar sakta hun? 😊",
      sender: 'bot',
      timestamp: new Date(),
      status: 'sent',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light unless explicitly set to dark
    return localStorage.getItem('theme') === 'dark';
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await sendMessageToWebhook(userMessage.content, user);
      
      setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: 'sent' } : m));

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: result.output || result.message || "",
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, status: 'sent' } : m));
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: "Asalam o Alayikum!! Main aap ki kia help kar sakta hun? 😊",
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
      },
    ]);
    setIsSettingsOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex h-[100dvh] transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 border-r transition-all duration-300 z-50 md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
            <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>NovaChat</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <h3 className={`text-[11px] font-bold uppercase tracking-widest px-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Conversations</h3>
            <button className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-all ${isDarkMode ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
              Current Chat
            </button>
          </div>
        </div>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-2xl mb-2 transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover bg-white ring-2 ring-white" />
            <div className="flex-1 overflow-hidden">
              <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
              <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-sm font-semibold ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/30' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-white shadow-sm'}`}>
        <header className={`flex items-center justify-between px-4 md:px-8 py-4 border-b z-10 backdrop-blur-md transition-colors ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="flex flex-col">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Assistant
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </h2>
              <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Always active</span>
            </div>
          </div>
          
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl transition-all ${isSettingsOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65(null) -1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>

            {isSettingsOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-600'}`}>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 mr-1 text-base">
                    {isDarkMode ? '☀️' : '🌙'}
                  </span>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className={`h-px my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                <button 
                  onClick={clearChat}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 mr-1 text-base">
                    🗑️
                  </span>
                  Clear Chat
                </button>
                <button 
                  onClick={onLogout}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors ${isDarkMode ? 'hover:bg-red-950/30' : 'hover:bg-red-50'}`}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 mr-1 text-base">
                    🚪
                  </span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[65%] flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap transition-all duration-300 ${
                    message.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : (isDarkMode ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700' : 'bg-[#f1f5f9] text-slate-800 rounded-tl-none border border-slate-100')
                  }`}
                >
                  {message.content}
                </div>
                <span className={`text-[10px] mt-2 px-2 font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  {message.sender === 'user' ? 'You' : 'Nova'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`px-5 py-4 rounded-3xl rounded-tl-none flex gap-1.5 animate-pulse ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={`p-4 md:p-8 border-t transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
          <form 
            onSubmit={handleSend}
            className={`max-w-4xl mx-auto flex items-center gap-2 border p-2 md:p-3 pl-6 rounded-3xl transition-all shadow-sm ${
              isDarkMode ? 'bg-slate-900 border-slate-700 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-400/10'
            }`}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className={`flex-1 bg-transparent border-none focus:outline-none text-[15px] font-medium py-1.5 ${isDarkMode ? 'text-slate-100 placeholder:text-slate-600' : 'text-slate-700 placeholder:text-slate-400'}`}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                inputValue.trim() && !isTyping ? 'bg-indigo-600 text-white shadow-xl hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
          <p className="text-center mt-4 text-[11px] font-medium text-slate-400">
            Powered by Reckit Labs AI • Encrypted & Secure
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
