import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { toast } from 'sonner';

export default function AuthModal({ open, onClose, mode, setMode }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Logged in successfully');
      } else {
        await register(email, password, name);
        toast.success('Account created successfully');
      }
      onClose();
      setEmail(''); setPassword(''); setName('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            data-testid="auth-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative glass p-8 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <button
              data-testid="auth-modal-close"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors duration-200"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white">
                {mode === 'login' ? 'Welcome Back' : 'Join Cheatcore'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-widest">
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    data-testid="auth-name-input"
                    type="text"
                    placeholder="Username"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 text-white placeholder:text-gray-600 focus:border-cc-blue focus:outline-none focus:ring-1 focus:ring-cc-blue transition-colors duration-200 text-sm"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  data-testid="auth-email-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 text-white placeholder:text-gray-600 focus:border-cc-blue focus:outline-none focus:ring-1 focus:ring-cc-blue transition-colors duration-200 text-sm"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  data-testid="auth-password-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/10 text-white placeholder:text-gray-600 focus:border-cc-blue focus:outline-none focus:ring-1 focus:ring-cc-blue transition-colors duration-200 text-sm"
                />
              </div>

              <button
                data-testid="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cc-blue text-black font-heading font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-shadow duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-600 font-mono uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              data-testid="auth-google-btn"
              onClick={loginWithGoogle}
              className="w-full py-3 border border-white/10 text-white font-heading text-sm uppercase tracking-widest hover:bg-white/5 transition-colors duration-200 flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 text-center">
              <button
                data-testid="auth-toggle-mode"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-sm text-gray-500 hover:text-cc-blue transition-colors duration-200"
              >
                {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
