
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, LayoutDashboard, Home, Globe, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChatBot from '../AICompanion/ChatBot';

const BaseLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(user?.email === 'admin@gmail.com' ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-on-background selection:bg-primary selection:text-on-primary">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-container-lowest/80 border-b border-surface-container-low transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
              <Menu className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-headline font-extrabold text-on-surface tracking-tight group-hover:text-primary transition-colors">
              Community <span className="text-primary">Hero</span>
            </span>
          </div>
          
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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-surface-container-low/50 pl-4 pr-1 py-1 rounded-full border border-surface-container-highest/50 shadow-sm">
                <span className="text-sm font-label font-semibold text-on-surface-variant hidden sm:block truncate max-w-[150px]">
                  {user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center justify-center p-2 rounded-full bg-surface-container-lowest text-error hover:bg-error-container hover:text-on-error-container transition-all duration-200 active:scale-90 shadow-sm border border-surface-container-highest/50"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 text-sm font-label font-bold text-on-primary bg-primary hover:bg-surface-tint active:scale-95 transition-all duration-200 px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,92,85,0.25)] hover:shadow-[0_6px_16px_rgba(0,92,85,0.35)]"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto relative flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-surface-container-lowest border-t border-surface-container-low mt-auto py-12 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-8">
          
          <div className="w-full flex items-center justify-center gap-4">
            <div className="h-px bg-surface-container-highest flex-1 max-w-[100px] md:max-w-[200px]"></div>
            <span className="text-sm font-label font-bold text-outline-variant uppercase tracking-widest whitespace-nowrap">
              DEVELOPED BY <span className="text-on-surface ml-1">B A FAREED AHAMED</span>
            </span>
            <div className="h-px bg-surface-container-highest flex-1 max-w-[100px] md:max-w-[200px]"></div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/fareedahamed0425-code" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-surface-container-highest bg-surface-container-low hover:bg-surface-container-highest text-on-surface font-label font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GITHUB
            </a>
            <a 
              href="https://bafareedahamedportfolio.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-surface-container-highest bg-surface-container-low hover:bg-surface-container-highest text-on-surface font-label font-bold text-sm transition-all shadow-sm active:scale-95"
            >
              <Globe className="h-4 w-4" />
              PORTFOLIO
            </a>
          </div>

        </div>
      </footer>

      {/* Global AI ChatBot Widget */}
      <ChatBot />
    </div>
  );
};

export default BaseLayout;
