import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { registerUser, loginUser, googleLogin, clearAuthError } from '../redux/slices/authSlice.js';
import { Lock, Mail, User, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error } = useSelector((state) => state.auth);

  // Modes: 'login', 'signup', 'forgot'
  const [mode, setMode] = useState('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password reset message
  const [resetMessage, setResetMessage] = useState('');

  // Redirect path logic
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
    dispatch(clearAuthError());
  }, [user, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    setResetMessage('');

    if (mode === 'login') {
      dispatch(loginUser({ email, password }));
    } else if (mode === 'signup') {
      dispatch(registerUser({ name, email, password }));
    } else if (mode === 'forgot') {
      // Mock forgot trigger
      if (email.trim()) {
        setResetMessage('A security reset link has been dispatched to your email.');
      }
    }
  };

  const handleGoogleLoginMock = () => {
    dispatch(clearAuthError());
    dispatch(googleLogin({
      email: 'google_customer@myntra.com',
      name: 'Google Customer',
      googleId: 'g_oauth_123456789_mock',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-[#0a0c14] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-lg shadow-myntra space-y-6">
        
        {/* Toggle Panel Headers */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-myntra-pink via-red-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
            MYNTRA CLONE
          </h2>
          <p className="mt-2 text-xs text-myntra-gray dark:text-gray-400 font-semibold uppercase tracking-widest">
            {mode === 'login' ? 'Login to your account' : mode === 'signup' ? 'Create a new account' : 'Reset your password'}
          </p>
        </div>

        {/* Form Error alert messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded text-xs text-red-500 font-semibold flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Reset success message */}
        {resetMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 p-3 rounded text-xs text-emerald-600 font-semibold">
            {resetMessage}
          </div>
        )}

        {/* Core Input Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {mode === 'signup' && (
            <div className="relative">
              <input
                type="text" required placeholder="Full Name"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-gray-200 dark:border-gray-700 rounded text-xs text-myntra-dark dark:text-gray-100 outline-none focus:border-myntra-pink"
              />
              <User className="absolute left-3.5 top-3.5 text-myntra-gray" size={14} />
            </div>
          )}

          <div className="relative">
            <input
              type="email" required placeholder="Email Address"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-gray-200 dark:border-gray-700 rounded text-xs text-myntra-dark dark:text-gray-100 outline-none focus:border-myntra-pink"
            />
            <Mail className="absolute left-3.5 top-3.5 text-myntra-gray" size={14} />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <input
                type="password" required placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-gray-200 dark:border-gray-700 rounded text-xs text-myntra-dark dark:text-gray-100 outline-none focus:border-myntra-pink"
              />
              <Lock className="absolute left-3.5 top-3.5 text-myntra-gray" size={14} />
            </div>
          )}

          {/* Forgot link trigger (Login mode only) */}
          {mode === 'login' && (
            <div className="text-right">
              <button 
                type="button" onClick={() => setMode('forgot')}
                className="text-[10px] font-bold text-myntra-gray hover:text-myntra-pink uppercase transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Action submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-myntra-pink hover:bg-rose-600 disabled:bg-gray-300 text-white text-xs font-extrabold uppercase tracking-wider rounded shadow flex items-center justify-center gap-1.5 transition-colors"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Register Now' : 'Send Reset Link'}
          </button>
        </form>

        {/* Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-myntra-gray uppercase font-bold tracking-widest">Or login with</span>
              <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            </div>

            {/* Google OAuth Login Button */}
            <button
              onClick={handleGoogleLoginMock}
              type="button"
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 hover:border-myntra-pink rounded text-xs font-extrabold text-myntra-dark dark:text-gray-200 bg-white dark:bg-gray-800 flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.68 14.96 1 12 1 7.35 1 3.37 3.68 1.48 7.58l3.77 2.92C6.18 7.56 8.87 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.92c2.2-2.03 3.67-5.01 3.67-8.65z" />
                <path fill="#FBBC05" d="M5.25 14.77c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.48 7.03C.54 8.92 0 11.01 0 13.22s.54 4.3 1.48 6.19l3.77-2.92z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.76-2.92c-1.1.74-2.52 1.18-4.2 1.18-3.13 0-5.82-2.52-6.77-5.46L1.46 15.8C3.35 19.7 7.33 22.36 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        {/* Footer helper links to toggle modes */}
        <div className="text-center pt-2 text-xs text-myntra-gray dark:text-gray-400 font-semibold">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => setMode('signup')} className="text-myntra-pink hover:underline font-bold uppercase">Sign Up</button></p>
          ) : mode === 'signup' ? (
            <p>Already have an account? <button onClick={() => setMode('login')} className="text-myntra-pink hover:underline font-bold uppercase">Sign In</button></p>
          ) : (
            <p>Back to <button onClick={() => setMode('login')} className="text-myntra-pink hover:underline font-bold uppercase">Sign In</button></p>
          )}
        </div>

        {/* Quick Credentials Info box */}
        <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/10 p-3.5 rounded text-[10px] text-myntra-gray font-semibold leading-relaxed">
          <p className="text-myntra-dark dark:text-white font-extrabold uppercase flex items-center gap-1 mb-1"><Sparkles size={12} className="text-myntra-pink" /> Sandbox Accounts:</p>
          <p>• <span className="font-bold text-myntra-dark dark:text-gray-200">Customer</span>: user@myntra.com / password123</p>
          <p>• <span className="font-bold text-myntra-dark dark:text-gray-200">Administrator</span>: admin@myntra.com / password123</p>
        </div>

      </div>
    </div>
  );
};

export default Login;
