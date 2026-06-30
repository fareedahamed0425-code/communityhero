import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, LayoutDashboard, Home, Globe, ShieldAlert, FilePlus, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChatBot from '../AICompanion/ChatBot';
import HelplineModal from '../HelplineModal';

const BaseLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(user?.email === 'admin@gmail.com' ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-on-background selection:bg-primary selection:text-on-primary">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-container-lowest/80 border-b border-surface-container-low transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo - Left Side */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <span className="text-xl font-headline font-extrabold text-on-surface tracking-tight group-hover:text-primary transition-colors">
              Community <span className="text-primary">Hero</span>
            </span>
          </div>
          
          {/* Desktop Navigation - Middle */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-surface-container-low/50 p-1.5 rounded-2xl border border-surface-container-highest/50 shadow-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-label font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-surface-container-lowest shadow-sm text-primary ring-1 ring-outline-variant/30' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low active:scale-95'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-outline'}`} />
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* User Menu - Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low/50 p-1.5 pr-1.5 rounded-full transition-colors border border-transparent hover:border-surface-container-highest/50"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-sm font-label font-bold text-on-surface-variant hidden sm:block truncate max-w-[150px] pl-3">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                  <div className="bg-primary/10 p-2 rounded-full transition-all duration-300 hover:bg-primary/20">
                    <Menu className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-surface-container-low rounded-xl shadow-lg py-2 z-50 animate-fade-in-up origin-top-right">
                    
                    {/* Mobile Navigation Links */}
                    <div className="md:hidden border-b border-surface-container-low pb-2 mb-2">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link 
                            key={link.path}
                            to={link.path} 
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-label font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            {link.name}
                          </Link>
                        )
                      })}
                    </div>

                    {/* User Info (Mobile Only) */}
                    <div className="px-4 py-2 border-b border-surface-container-low mb-2 block sm:hidden">
                      <p className="text-xs text-on-surface-variant mb-1 font-label">Signed in as</p>
                      <p className="text-sm font-bold text-on-surface truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                    </div>
                    
                    {/* Action Options */}
                    <Link 
                      to="/report"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm font-label font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3"
                    >
                      <FilePlus className="h-4 w-4 text-primary" />
                      Report Issue
                    </Link>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        document.dispatchEvent(new CustomEvent('open-chatbot'));
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-label font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3"
                    >
                      <MessageCircle className="h-4 w-4 text-secondary" />
                      AI Chatbot
                    </button>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsHelplineOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-label font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3"
                    >
                      <Phone className="h-4 w-4 text-tertiary" />
                      Helpline Numbers
                    </button>

                    <div className="border-t border-surface-container-low my-1"></div>

                    {/* Logout Button */}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-label font-bold text-error hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-3"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="hidden sm:flex items-center gap-2 text-sm font-label font-bold text-primary hover:bg-surface-container-low active:scale-95 transition-all duration-200 px-4 py-2 rounded-xl"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="flex items-center gap-2 text-sm font-label font-bold text-on-primary bg-primary hover:bg-surface-tint active:scale-95 transition-all duration-200 px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,92,85,0.25)] hover:shadow-[0_6px_16px_rgba(0,92,85,0.35)]"
                >
                  <User className="h-4 w-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto relative flex flex-col">
        <Outlet />
      </main>

      {location.pathname === '/' && (
        <footer className="bg-surface-container-lowest border-t border-surface-container-low mt-auto py-6 z-10 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
            
            <div className="w-full flex items-center justify-center gap-4">
              <div className="h-px bg-surface-container-highest flex-1 max-w-[100px] md:max-w-[200px]"></div>
              <span className="text-xs font-label font-bold text-outline-variant uppercase tracking-widest whitespace-nowrap">
                DEVELOPED BY <span className="text-on-surface ml-1">B A FAREED AHAMED</span>
              </span>
              <div className="h-px bg-surface-container-highest flex-1 max-w-[100px] md:max-w-[200px]"></div>
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/fareedahamed0425-code" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-surface-container-highest bg-surface-container-low hover:bg-surface-container-highest text-on-surface font-label font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GITHUB
              </a>
              <a 
                href="https://bafareedahamedportfolio.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-surface-container-highest bg-surface-container-low hover:bg-surface-container-highest text-on-surface font-label font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <Globe className="h-3 w-3" />
                PORTFOLIO
              </a>
            </div>

          </div>
        </footer>
      )}

      {/* Global AI ChatBot Widget */}
      <ChatBot />

      {/* Helplines Modal */}
      <HelplineModal isOpen={isHelplineOpen} onClose={() => setIsHelplineOpen(false)} />
    </div>
  );
};

export default BaseLayout;
