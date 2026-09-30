import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    loginWithGoogle,
    register,
    showToast,
  } = useBloggr();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        if (!email.trim() && !username.trim()) {
          setErrorMessage('Please enter your email or username');
          setIsSubmitting(false);
          return;
        }
        const success = await login(email.trim() || username.trim(), password);
        if (!success) {
          setErrorMessage('Unable to log in. Please check credentials.');
        }
      } else {
        if (!username.trim() || !email.trim()) {
          setErrorMessage('Username and email are required');
          setIsSubmitting(false);
          return;
        }
        const success = await register({
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          email: email.trim(),
          password: password || undefined,
          bio: bio.trim() || undefined,
        });
        if (!success) {
          setErrorMessage('Registration failed. Please try another username.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoUser: string) => {
    login(demoEmail, 'demo123');
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" />

        <div className="p-5 sm:p-6">
          {/* Close button */}
          <button
            id="close-auth-modal-btn"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand & Title */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 text-lg font-black tracking-tight text-neutral-900 dark:text-white">
              <span>bloggr</span>
              <span className="text-orange-500">.</span>
              <span className="text-xs px-2 py-0.5 ml-2 font-semibold rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                News Wire Auth
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
              {authModalMode === 'login' ? 'Sign in to your account' : 'Create a reader or reporter profile'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {authModalMode === 'login'
                ? 'Access your bookmarked dispatches, alerts, and publishing privileges.'
                : 'Join our digital news wire covering Kenya, Africa, and world affairs.'}
            </p>
          </div>

          {/* Continue with Google (Google Auth Integration) */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={async () => {
              setErrorMessage(null);
              setIsSubmitting(true);
              try {
                await loginWithGoogle();
              } catch (e: any) {
                setErrorMessage(e?.message || 'Google Sign-In failed');
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="w-full mb-3 py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 active:scale-[0.98] text-neutral-800 dark:text-neutral-100 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <span className="relative px-2 bg-white dark:bg-neutral-900 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              or continue with email
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl mb-4 text-xs font-semibold">
            <button
              id="auth-tab-login"
              onClick={() => {
                setAuthModalMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                authModalMode === 'login'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-register"
              onClick={() => {
                setAuthModalMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                authModalMode === 'register'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error notification */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {authModalMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      id="register-display-name-input"
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="e.g. Sarah Mwangi"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="text-xs text-neutral-400 absolute left-3 top-2.5 font-bold">@</span>
                    <input
                      id="register-username-input"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="sarah_reporter"
                      required
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {authModalMode === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="auth-email-input"
                  type={authModalMode === 'login' ? 'text' : 'email'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={authModalMode === 'login' ? 'alex.rider@bloggr.news or AlexRider' : 'your.email@news.com'}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="auth-password-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {authModalMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Bio / Beats (Optional)
                </label>
                <textarea
                  id="register-bio-input"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Covering Nairobi tech ecosystems, green transit, and sports..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2 font-medium">
              <span>Quick Demo Accounts:</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> One-click login
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-login-admin"
                onClick={() => login('info@bloggr.org', 'Mesh2000!!!')}
                className="p-2 rounded-xl border border-amber-300 dark:border-amber-700/60 hover:border-orange-500 text-left bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all text-xs"
              >
                <div className="font-bold text-amber-900 dark:text-amber-200 truncate flex items-center gap-1">
                  <span>Bloggr</span>
                  <CheckCircle2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400">Admin Account</div>
              </button>

              <button
                type="button"
                id="demo-login-alex"
                onClick={() => handleQuickLogin('alex.rider@bloggr.news', 'AlexRider')}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-orange-500/40 text-left bg-neutral-50 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 transition-all text-xs"
              >
                <div className="font-bold text-neutral-900 dark:text-white truncate">Alex Rider</div>
                <div className="text-[10px] text-neutral-400">Reporter & Editor</div>
              </button>

              <button
                type="button"
                id="demo-login-elena"
                onClick={() => handleQuickLogin('elena.vance@bloggr.news', 'ElenaVance')}
                className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-orange-500/40 text-left bg-neutral-50 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 transition-all text-xs"
              >
                <div className="font-bold text-neutral-900 dark:text-white truncate">Elena Vance</div>
                <div className="text-[10px] text-neutral-400">Africa Bureau</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
