import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { InputField } from '../common/FormField';
import Button from '../common/Button';

export default function LoginForm({ onSuccess, onError, onNavigate, onLoginSuccess, initialEmail = '' }) {
  const { loginUser } = useAuth();
  const [loginEmail, setLoginEmail] = useState(initialEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setLoginEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!loginEmail.includes('@')) return onError('Please enter a valid email address.');
    if (!loginPassword) return onError('Please enter your password.');
    
    onError('');
    setIsSubmitting(true);
    try {
      await loginUser(loginEmail, loginPassword);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      if (err.message?.includes('not verified')) {
        onNavigate('verify', { email: loginEmail });
      }
      onError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <InputField label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
          <button 
            type="button" 
            onClick={() => { onError(''); onNavigate('forgot', { email: loginEmail }); }} 
            style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Forgot?
          </button>
        </div>
        <InputField label="Password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
      </div>
      <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
