import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import RegisterForm from './RegisterForm';
import VerifyForm from './VerifyForm';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

export default function AuthForms({ onSuccess }) {
  const {
    pendingVerificationEmail,
    activeVerificationCode
  } = useAuth();

  const [authStep, setAuthStep] = useState('login');
  
  // Shared state for navigation between forms
  const [navData, setNavData] = useState({});

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (pendingVerificationEmail) {
      setAuthStep('verify');
      setNavData({ 
        email: pendingVerificationEmail, 
        code: activeVerificationCode || '' 
      });
    }
  }, [pendingVerificationEmail, activeVerificationCode]);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleNavigate = (step, data = {}) => {
    setAuthStep(step);
    setNavData(data);
    clearMessages();
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
        <ActionButton onClick={() => handleNavigate('register')} isActive={authStep === 'register'} text="1. Register" />
        <ActionButton onClick={() => handleNavigate('verify')} isActive={authStep === 'verify'} text="2. Verify" />
        <ActionButton onClick={() => handleNavigate('login')} isActive={['login', 'forgot', 'reset'].includes(authStep)} text="3. Login" />
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
        <RegisterForm 
          onSuccess={setSuccessMsg} 
          onError={setErrorMsg} 
          onNavigate={handleNavigate} 
        />
      )}

      {authStep === 'verify' && (
        <VerifyForm 
          initialEmail={navData.email}
          initialCode={navData.code}
          onSuccess={setSuccessMsg} 
          onError={setErrorMsg} 
          onNavigate={handleNavigate} 
        />
      )}

      {authStep === 'login' && (
        <LoginForm 
          initialEmail={navData.email}
          onLoginSuccess={onSuccess}
          onSuccess={setSuccessMsg} 
          onError={setErrorMsg} 
          onNavigate={handleNavigate} 
        />
      )}

      {authStep === 'forgot' && (
        <ForgotPasswordForm 
          initialEmail={navData.email}
          onSuccess={setSuccessMsg} 
          onError={setErrorMsg} 
          onNavigate={handleNavigate} 
        />
      )}

      {authStep === 'reset' && (
        <ResetPasswordForm 
          initialEmail={navData.email}
          initialToken={navData.token}
          onSuccess={setSuccessMsg} 
          onError={setErrorMsg} 
          onNavigate={handleNavigate} 
        />
      )}
    </>
  );
}
