import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

export default function LoginModal() {
  const {
    showLoginModal,
    setShowLoginModal,
    demoUsers,
    loginAsDemo,
    registerUser,
    verifyUserEmail,
    loginUser,
    requestPasswordReset,
    completePasswordReset,
    pendingVerificationEmail,
    activeVerificationCode
  } = useAuth();

  // Step Mode: 'register' | 'verify' | 'login' | 'forgot' | 'reset'
  const [authStep, setAuthStep] = useState('register');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Project Documentation Engineer');

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

  if (!showLoginModal) return null;

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
      setShowLoginModal(false);
    } catch (err) {
      // If error indicates unverified email, transition to verify step
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.25rem',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'hsl(var(--text-muted))',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Auth Pipeline Stepper Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setAuthStep('register'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.45rem 0.2rem',
              borderRadius: '7px',
              border: 'none',
              background: authStep === 'register' ? 'hsl(var(--primary))' : 'transparent',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            1. Register
          </button>
          <button
            onClick={() => { setAuthStep('verify'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.45rem 0.2rem',
              borderRadius: '7px',
              border: 'none',
              background: authStep === 'verify' ? 'hsl(var(--primary))' : 'transparent',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            2. Verify Email
          </button>
          <button
            onClick={() => { setAuthStep('login'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.45rem 0.2rem',
              borderRadius: '7px',
              border: 'none',
              background: (authStep === 'login' || authStep === 'forgot' || authStep === 'reset') ? 'hsl(var(--primary))' : 'transparent',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            3. Login
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0 }}>
            {authStep === 'register' && 'Account Registration'}
            {authStep === 'verify' && 'Verify Email Address'}
            {authStep === 'login' && 'Account Login'}
            {authStep === 'forgot' && 'Forgot Password'}
            {authStep === 'reset' && 'Set New Password'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.35rem 0 0 0' }}>
            {authStep === 'register' && 'Register your details to generate your verification code'}
            {authStep === 'verify' && 'Enter the 6-digit code to activate your account'}
            {authStep === 'login' && 'Enter your password to obtain Access & Refresh Tokens'}
            {authStep === 'forgot' && 'Enter your registered email address to reset your password'}
            {authStep === 'reset' && 'Enter your reset token and choose a new password'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              color: 'hsl(var(--danger))',
              fontSize: '0.75rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              color: 'hsl(var(--success))',
              fontSize: '0.75rem',
              marginBottom: '1.25rem',
              textAlign: 'center'
            }}
          >
            {successMsg}
          </div>
        )}

        {/* STEP 1. REGISTER FORM */}
        {authStep === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Job Title / Role</label>
              <input
                type="text"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                placeholder="e.g. Lead Structural Engineer"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Password (min 6 chars)</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Register & Send Code ➔
            </button>
          </form>
        )}

        {/* STEP 2. VERIFY EMAIL FORM */}
        {authStep === 'verify' && (
          <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
              <input
                type="email"
                value={verifyEmailInput}
                onChange={(e) => setVerifyEmailInput(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>6-Digit Verification Code</label>
              <input
                type="text"
                value={verifyCodeInput}
                onChange={(e) => setVerifyCodeInput(e.target.value)}
                placeholder="e.g. 849201"
                required
                maxLength={6}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.65rem 0.8rem',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Verify Email Code ➔
            </button>
          </form>
        )}

        {/* STEP 3. LOGIN FORM */}
        {authStep === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setAuthStep('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--primary))',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
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
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Sign In & Open Dashboard
            </button>
          </form>
        )}

        {/* STEP 4. FORGOT PASSWORD FORM */}
        {authStep === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Request Password Reset ➔
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => { setAuthStep('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* STEP 5. RESET PASSWORD FORM */}
        {authStep === 'reset' && (
          <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>Reset Token</label>
              <input
                type="text"
                value={resetTokenInput}
                onChange={(e) => setResetTokenInput(e.target.value)}
                placeholder="Paste reset token here"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>New Password (min 6 chars)</label>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              Save New Password ➔
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={() => { setAuthStep('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
