import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

export default function LandingPage() {
  const {
    registerUser,
    verifyUserEmail,
    loginUser,
    requestPasswordReset,
    completePasswordReset,
    pendingVerificationEmail,
    activeVerificationCode
  } = useAuth();

  // Step Mode: 'login' | 'register' | 'verify' | 'forgot' | 'reset'
  const [authStep, setAuthStep] = useState('login');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Developer');

  // Verify inputs
  const [verifyEmailInput, setVerifyEmailInput] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot / Reset password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (pendingVerificationEmail) {
      setAuthStep('verify');
      setVerifyEmailInput(pendingVerificationEmail);
      if (activeVerificationCode) {
        setVerifyCodeInput(activeVerificationCode);
      }
    }
  }, [pendingVerificationEmail, activeVerificationCode]);

  // 1. Handle Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!regEmail || !regEmail.includes('@')) {
      setErrorMsg('A valid email address is required.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await registerUser(regName, regEmail, regPassword, regRole);
      setVerifyEmailInput(regEmail);
      if (res.verificationCode) {
        setVerifyCodeInput(res.verificationCode);
      }
      setSuccessMsg(`Account created! A 6-digit verification code (${res.verificationCode || '123456'}) has been generated.`);
      setAuthStep('verify');
    } catch (err) {
      setErrorMsg(err.message || 'Account registration failed.');
    }
  };

  // 2. Handle Email Verification
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyEmailInput || !verifyEmailInput.includes('@')) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!verifyCodeInput || !verifyCodeInput.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await verifyUserEmail(verifyEmailInput, verifyCodeInput);
      setSuccessMsg(res.message || 'Email successfully verified! Please log in to continue.');
      setLoginEmail(verifyEmailInput);
      setAuthStep('login');
    } catch (err) {
      setErrorMsg(err.message || 'Email verification failed.');
    }
  };

  // 3. Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await loginUser(loginEmail, loginPassword);
    } catch (err) {
      if (err.message && err.message.includes('not verified')) {
        setVerifyEmailInput(loginEmail);
        setAuthStep('verify');
      }
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // 4. Handle Request Reset (Forgot Password)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await requestPasswordReset(forgotEmail);
      setSuccessMsg(res.message || 'Password reset token generated! Check server log or enter token below.');
      if (res.token) {
        setResetTokenInput(res.token);
      }
      setAuthStep('reset');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset request failed.');
    }
  };

  // 5. Handle Complete Password Reset
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetTokenInput || !resetTokenInput.trim()) {
      setErrorMsg('Reset token is required.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await completePasswordReset(resetTokenInput, resetNewPassword);
      setSuccessMsg(res.message || 'Password reset successful! You can now log in with your new password.');
      setLoginEmail(forgotEmail);
      setAuthStep('login');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
        padding: '2rem 1.5rem',
        color: 'white',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '3rem',
          alignItems: 'center'
        }}
        className="landing-grid-responsive"
      >
        {/* Left Side: Pitch and Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Introducing AetherTasks v1.0</span>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1.1, background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elevate Your Daily Flow
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'hsl(var(--text-muted))', marginTop: '0.75rem', lineHeight: '1.6' }}>
              A premium, lightweight task organization ecosystem designed with crystal-clear analytics, historical activity logs, and a glassmorphic dashboard interface.
            </p>
          </div>

          {/* Core App Features Show List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'hsl(var(--primary))', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Intelligent Task Board</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Plan submittals, QA steps, or personal tasks with categorized tags and due dates.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'hsl(var(--accent))', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Real-time Analytics</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>View productivity stats, progress charts, and category distributions instantly.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', color: 'hsl(var(--text-secondary))', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Activity History Audits</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Track every single action, update, or deletion in a chronological audit log.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Glass Panel */}
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '2.5rem',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '10px', marginBottom: '2rem' }}>
            <button
              onClick={() => { setAuthStep('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '0.6rem 0.2rem',
                borderRadius: '7px',
                border: 'none',
                background: authStep === 'login' || authStep === 'forgot' || authStep === 'reset' ? 'hsl(var(--primary))' : 'transparent',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthStep('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '0.6rem 0.2rem',
                borderRadius: '7px',
                border: 'none',
                background: authStep === 'register' || authStep === 'verify' ? 'hsl(var(--primary))' : 'transparent',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Register
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              {authStep === 'login' && 'Welcome Back'}
              {authStep === 'register' && 'Create Account'}
              {authStep === 'verify' && 'Verify Email Address'}
              {authStep === 'forgot' && 'Reset Password Request'}
              {authStep === 'reset' && 'Create New Password'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              {authStep === 'login' && 'Access your dashboard workspace'}
              {authStep === 'register' && 'Unlock complete analytics dashboard and tasks'}
              {authStep === 'verify' && 'Enter the 6-digit code sent to your email'}
              {authStep === 'forgot' && 'Request an instant password reset token'}
              {authStep === 'reset' && 'Provide your reset token and new credentials'}
            </p>
          </div>

          {/* Status Banners */}
          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem', color: 'hsl(var(--danger))', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.65rem 0.85rem', color: 'hsl(var(--success))', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Mode Forms */}

          {/* 1. SIGN IN FORM */}
          {authStep === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(loginEmail); setAuthStep('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Sign In & Open Dashboard ➔
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {authStep === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Workspace Role</label>
                <input
                  type="text"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  placeholder="e.g. Lead Developer, QA Tester"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Password (min 6 chars)</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Register & Send Code ➔
              </button>
            </form>
          )}

          {/* 3. VERIFY EMAIL FORM */}
          {authStep === 'verify' && (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  value={verifyEmailInput}
                  onChange={(e) => setVerifyEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>6-Digit Verification Code</label>
                <input
                  type="text"
                  value={verifyCodeInput}
                  onChange={(e) => setVerifyCodeInput(e.target.value)}
                  placeholder="e.g. 849201"
                  required
                  maxLength={6}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.2em', textAlign: 'center', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Verify Email Code ➔
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {authStep === 'forgot' && (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Request Password Reset ➔
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setAuthStep('login'); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD FORM */}
          {authStep === 'reset' && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Reset Token</label>
                <input
                  type="text"
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  placeholder="Paste reset token here"
                  required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>New Password (min 6 chars)</label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.7rem 0.9rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Save New Password ➔
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setAuthStep('login'); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
