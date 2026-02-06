import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, LogOut, LayoutDashboard, Key, ShieldCheck, Menu, X, Package, BookOpen } from 'lucide-react';
import { useAuth } from '../App';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showAccount, setShowAccount] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShowAccount(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccount(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <motion.header
        data-testid="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled ? 'glass shadow-lg shadow-black/50' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/status"
                data-testid="nav-status"
                className="font-heading text-sm uppercase tracking-widest text-gray-400 hover:text-cc-blue transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Status
                </div>
              </Link>

              {/* Products - Direct Link */}
              <Link
                to="/products"
                data-testid="nav-products"
                className="font-heading text-sm uppercase tracking-widest text-gray-400 hover:text-cc-blue transition-colors duration-200 flex items-center gap-2"
              >
                <Package size={16} />
                Products
              </Link>
            </nav>

            {/* Center Brand */}
            <Link to="/" data-testid="brand-logo" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:mx-auto">
              <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tighter uppercase">
                <span className="text-white">Cheat</span>
                <span className="text-cc-blue neon-blue">core</span>
              </h1>
            </Link>

            {/* Right - Account */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div ref={accountRef} className="relative">
                  <button
                    data-testid="account-dropdown-trigger"
                    onClick={() => setShowAccount(!showAccount)}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-white/20" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-cc-blue/20 border border-cc-blue/50 flex items-center justify-center">
                        <User size={14} className="text-cc-blue" />
                      </div>
                    )}
                    <span className="font-heading text-sm uppercase tracking-wide">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showAccount ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showAccount && (
                      <motion.div
                        data-testid="account-dropdown-menu"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-4 glass p-3 min-w-[200px]"
                      >
                        <div className="px-3 py-2 border-b border-white/10 mb-2">
                          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Signed in as</p>
                          <p className="text-sm text-white truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/dashboard"
                          data-testid="account-dashboard-link"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                          onClick={() => setShowAccount(false)}
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard"
                          data-testid="account-licenses-link"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                          onClick={() => setShowAccount(false)}
                        >
                          <Key size={16} />
                          License Keys
                        </Link>
                        <button
                          data-testid="account-logout-btn"
                          onClick={() => { logout(); setShowAccount(false); navigate('/'); }}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-cc-red hover:bg-white/5 w-full text-left transition-colors duration-200"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    data-testid="nav-login-btn"
                    onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                    className="font-heading text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Login
                  </button>
                  <button
                    data-testid="nav-register-btn"
                    onClick={() => { setAuthMode('register'); setShowAuth(true); }}
                    className="font-heading text-xs uppercase tracking-widest px-5 py-2 bg-cc-blue text-black font-bold hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow duration-300 skew-x-[-8deg]"
                  >
                    <span className="inline-block skew-x-[8deg]">Register</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              data-testid="mobile-menu-toggle"
              className="md:hidden text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/10"
            >
              <div className="px-6 py-4 space-y-4">
                <Link to="/status" className="block text-sm uppercase tracking-widest text-gray-400 hover:text-cc-blue">Status</Link>
                <Link to="/products" className="block text-sm uppercase tracking-widest text-gray-400 hover:text-cc-blue">Products</Link>
                {user ? (
                  <>
                    <Link to="/dashboard" className="block text-sm uppercase tracking-widest text-gray-400 hover:text-cc-blue">Dashboard</Link>
                    <button onClick={() => { logout(); navigate('/'); }} className="block text-sm uppercase tracking-widest text-cc-red">Logout</button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => { setAuthMode('login'); setShowAuth(true); setMobileOpen(false); }} className="text-sm uppercase tracking-widest text-gray-400">Login</button>
                    <button onClick={() => { setAuthMode('register'); setShowAuth(true); setMobileOpen(false); }} className="text-sm uppercase tracking-widest text-cc-blue">Register</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} mode={authMode} setMode={setAuthMode} />
    </>
  );
}
