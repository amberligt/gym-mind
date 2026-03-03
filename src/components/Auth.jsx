/**
 * Auth screen — premium athletic entry.
 * Orange + Blue only. Performance-first. High contrast.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';

const INPUT_CLASS = `
  w-full min-h-[48px] bg-white border-2 border-[#E2E8F0]
  rounded-xl px-4 text-[#0F172A] placeholder-[#475569]/70
  outline-none focus:border-[#3B82F6] focus:ring-0
  disabled:opacity-50 transition-colors
`;

export default function Auth() {
  const {
    signInWithPassword,
    signUpWithPassword,
    signInWithMagicLink,
    resetPassword,
    updatePassword,
    needsPasswordReset,
    clearPasswordReset,
  } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (needsPasswordReset) setMode('setPassword');
  }, [needsPasswordReset]);

  const clearState = () => {
    setError(null);
    setMessage(null);
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6 || loading) return;
    setLoading(true);
    clearState();
    try {
      await updatePassword(password);
      clearPasswordReset();
      setMode('signin');
      setPassword('');
      setMessage('Password updated. You can now sign in.');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;
    setLoading(true);
    clearState();
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || loading) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    clearState();
    try {
      await signUpWithPassword(email.trim(), password);
      setMessage('Check your email to confirm your account.');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    clearState();
    try {
      await signInWithMagicLink(email.trim());
      setMode('magicSent');
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    clearState();
    try {
      await resetPassword(email.trim());
      setMessage('Check your email for the password reset link.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'setPassword') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-[#F8FAFC]">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold text-[#0F172A] text-center mb-2">Set new password</h1>
          <p className="text-[#475569] text-sm text-center mb-6">Enter your new password below.</p>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
              className={INPUT_CLASS}
            />
            <PrimaryButton type="submit" disabled={!password || password.length < 6} loading={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </PrimaryButton>
          </form>
          {error && <p className="mt-4 text-[#EA580C] text-sm font-medium">{error}</p>}
          {message && <p className="mt-4 text-[#3B82F6] text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  if (mode === 'magicSent') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-[#F8FAFC]">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Check your email</h1>
          <p className="text-[#475569] mt-2 text-base">
            We sent a magic link to <strong className="text-[#0F172A]">{email}</strong>. Click it to sign in.
          </p>
          <button
            onClick={() => { setMode('magic'); clearState(); }}
            className="mt-6 text-[#1E3A8A] text-sm font-medium"
          >
            Use different email
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'magic') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-[#F8FAFC]">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-[#0F172A] text-center mb-2">Magic link</h1>
          <p className="text-[#475569] text-sm text-center mb-6">We&rsquo;ll send a link to your email. No password needed.</p>
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
              className={INPUT_CLASS}
            />
            <PrimaryButton type="submit" disabled={!email.trim()} loading={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </PrimaryButton>
          </form>
          <button
            onClick={() => { setMode('signin'); clearState(); }}
            className="mt-4 w-full text-[#475569] text-sm text-center"
          >
            ← Back to sign in
          </button>
          {error && <p className="mt-4 text-[#EA580C] text-sm font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-[#F8FAFC]">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-[#0F172A] text-center mb-2">Reset password</h1>
          <p className="text-[#475569] text-sm text-center mb-6">Enter your email and we&rsquo;ll send a reset link.</p>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
              className={INPUT_CLASS}
            />
            <PrimaryButton type="submit" disabled={!email.trim()} loading={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </PrimaryButton>
          </form>
          <button
            onClick={() => { setMode('signin'); clearState(); }}
            className="mt-4 w-full text-[#475569] text-sm text-center"
          >
            ← Back to sign in
          </button>
          {error && <p className="mt-4 text-[#EA580C] text-sm font-medium">{error}</p>}
          {message && <p className="mt-4 text-[#3B82F6] text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 bg-[#F8FAFC]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">GYMmind</h1>
            <p className="text-[#475569] mt-2 text-base">Create your account</p>
          </div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
              className={INPUT_CLASS}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
              className={INPUT_CLASS}
            />
            <PrimaryButton type="submit" disabled={!email.trim() || !password} loading={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </PrimaryButton>
          </form>
          <button
            onClick={() => { setMode('signin'); clearState(); setPassword(''); }}
            className="mt-4 w-full text-[#475569] text-sm text-center"
          >
            Already have an account? Sign in
          </button>
          {error && <p className="mt-4 text-[#EA580C] text-sm font-medium">{error}</p>}
          {message && <p className="mt-4 text-[#3B82F6] text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  // mode === 'signin'
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 bg-[#F8FAFC]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">GYMmind</h1>
          <p className="text-[#475569] mt-2 text-base">Train smarter. Lift stronger.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={loading}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            disabled={loading}
            className={INPUT_CLASS}
          />
          <PrimaryButton type="submit" disabled={!email.trim() || !password} loading={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </PrimaryButton>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center">
          <button
            type="button"
            onClick={() => { setMode('forgot'); clearState(); }}
            className="text-[#475569] text-sm"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); clearState(); setPassword(''); }}
            className="text-[#1E3A8A] text-sm font-medium"
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="mt-4 border-2 border-[#EA580C]/50 bg-[#FFF7ED] text-[#EA580C] rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
