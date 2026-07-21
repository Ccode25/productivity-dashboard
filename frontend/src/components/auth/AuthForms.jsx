import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { InputField } from '../common/FormField';
import Button from '../common/Button';

export default function AuthForms({ onSuccess }) {
  const {
    registerUser,
    verifyUserEmail,
    loginUser,
    requestPasswordReset,
    completePasswordReset,
    pendingVerificationEmail,
    activeVerificationCode
  } = useAuth();

  const [authStep, setAuthStep] = useState('login');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Developer');

  const [verifyEmailInput, setVerifyEmailInput] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim()) return setErrorMsg('Full name is required.');
    if (!regEmail.includes('@')) return setErrorMsg('A valid email address is required.');
    if (regPassword.length < 6) return setErrorMsg('Password must be at least 6 characters long.');
    
    clearMessages();
    try {
      const res = await registerUser(regName, regEmail, regPassword, regRole);
      setVerifyEmailInput(regEmail);
      if (res.verificationCode) setVerifyCodeInput(res.verificationCode);
      setSuccessMsg(`Account created! A 6-digit verification code (${res.verificationCode || '123456'}) has been generated.`);
      setAuthStep('verify');
    } catch (err) {
      setErrorMsg(err.message || 'Account registration failed.');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyEmailInput.includes('@')) return setErrorMsg('Please enter your email address.');
    if (!verifyCodeInput.trim()) return setErrorMsg('Please enter the 6-digit verification code.');
    
    clearMessages();
    try {
      const res = await verifyUserEmail(verifyEmailInput, verifyCodeInput);
      setSuccessMsg(res.message || 'Email verified! Please log in to continue.');
      setLoginEmail(verifyEmailInput);
      setAuthStep('login');
    } catch (err) {
      setErrorMsg(err.message || 'Email verification failed.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.includes('@')) return setErrorMsg('Please enter a valid email address.');
    if (!loginPassword) return setErrorMsg('Please enter your password.');
    
    clearMessages();
    try {
      await loginUser(loginEmail, loginPassword);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.message?.includes('not verified')) {
        setVerifyEmailInput(loginEmail);
        setAuthStep('verify');
      }
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) return setErrorMsg('Please enter a valid email address.');
    
    clearMessages();
    try {
      const res = await requestPasswordReset(forgotEmail);
      setSuccessMsg(res.message || 'Password reset token generated!');
      if (res.token) setResetTokenInput(res.token);
      setAuthStep('reset');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset request failed.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetTokenInput.trim()) return setErrorMsg('Reset token is required.');
    if (resetNewPassword.length < 6) return setErrorMsg('New password must be at least 6 characters long.');
    
    clearMessages();
    try {
      const res = await completePasswordReset(resetTokenInput, resetNewPassword);
      setSuccessMsg(res.message || 'Password reset successful! You can now log in.');
      setLoginEmail(forgotEmail);
      setAuthStep('login');
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed.');
    }
  };

  const ActionButton = ({ onClick, isActive, text }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.45rem 0.2rem',
        borderRadius: '7px',
        border: 'none',
        background: isActive ? 'hsl(var(--primary))' : 'transparent',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 700,
        cursor: 'pointer'
      }}
    >
      {text}
    </button>
  );

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
        <ActionButton onClick={() => { setAuthStep('register'); clearMessages(); }} isActive={authStep === 'register'} text="1. Register" />
        <ActionButton onClick={() => { setAuthStep('verify'); clearMessages(); }} isActive={authStep === 'verify'} text="2. Verify" />
        <ActionButton onClick={() => { setAuthStep('login'); clearMessages(); }} isActive={['login', 'forgot', 'reset'].includes(authStep)} text="3. Login" />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0 }}>
          {authStep === 'register' && 'Account Registration'}
          {authStep === 'verify' && 'Verify Email'}
          {authStep === 'login' && 'Account Login'}
          {authStep === 'forgot' && 'Forgot Password'}
          {authStep === 'reset' && 'Set New Password'}
        </h2>
      </div>

      {errorMsg && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'hsl(var(--danger))', fontSize: '0.75rem', marginBottom: '1.25rem', textAlign: 'center' }}>{errorMsg}</div>}
      {successMsg && <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: 'hsl(var(--success))', fontSize: '0.75rem', marginBottom: '1.25rem', textAlign: 'center' }}>{successMsg}</div>}

      {authStep === 'register' && (
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <InputField label="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
          <InputField label="Email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
          <InputField label="Role" value={regRole} onChange={(e) => setRegRole(e.target.value)} />
          <InputField label="Password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} />
          <Button type="submit" variant="primary" style={{ marginTop: '0.25rem' }}>Register</Button>
        </form>
      )}

      {authStep === 'verify' && (
        <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <InputField label="Email" type="email" value={verifyEmailInput} onChange={(e) => setVerifyEmailInput(e.target.value)} required />
          <InputField label="Code" value={verifyCodeInput} onChange={(e) => setVerifyCodeInput(e.target.value)} required maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.2em' }} />
          <Button type="submit" variant="primary" style={{ marginTop: '0.25rem' }}>Verify Code</Button>
        </form>
      )}

      {authStep === 'login' && (
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <InputField label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
              <button type="button" onClick={() => { setAuthStep('forgot'); clearMessages(); setForgotEmail(loginEmail); }} style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontSize: '0.75rem', cursor: 'pointer' }}>Forgot?</button>
            </div>
            <InputField label="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
          </div>
          <Button type="submit" variant="primary" style={{ marginTop: '0.25rem' }}>Sign In</Button>
        </form>
      )}

      {authStep === 'forgot' && (
        <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <InputField label="Email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
          <Button type="submit" variant="primary" style={{ marginTop: '0.25rem' }}>Request Reset</Button>
          <div style={{ textAlign: 'center' }}>
            <button type="button" onClick={() => { setAuthStep('login'); clearMessages(); }} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}>Back to Login</button>
          </div>
        </form>
      )}

      {authStep === 'reset' && (
        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <InputField label="Reset Token" value={resetTokenInput} onChange={(e) => setResetTokenInput(e.target.value)} required style={{ fontFamily: 'monospace' }} />
          <InputField label="New Password" type="password" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required minLength={6} />
          <Button type="submit" variant="primary" style={{ marginTop: '0.25rem' }}>Save Password</Button>
          <div style={{ textAlign: 'center' }}>
            <button type="button" onClick={() => { setAuthStep('login'); clearMessages(); }} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}>Back to Login</button>
          </div>
        </form>
      )}
    </>
  );
}
