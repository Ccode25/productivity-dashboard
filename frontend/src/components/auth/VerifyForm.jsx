import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { InputField } from '../common/FormField';
import Button from '../common/Button';

export default function VerifyForm({ onSuccess, onError, onNavigate, initialEmail = '', initialCode = '' }) {
  const { verifyUserEmail } = useAuth();
  const [verifyEmailInput, setVerifyEmailInput] = useState(initialEmail);
  const [verifyCodeInput, setVerifyCodeInput] = useState(initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setVerifyEmailInput(initialEmail);
    if (initialCode) setVerifyCodeInput(initialCode);
  }, [initialEmail, initialCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!verifyEmailInput.includes('@')) return onError('Please enter your email address.');
    if (!verifyCodeInput.trim()) return onError('Please enter the 6-digit verification code.');
    
    onError('');
    setIsSubmitting(true);
    try {
      const res = await verifyUserEmail(verifyEmailInput, verifyCodeInput);
      onSuccess(res.message || 'Email verified! Please log in to continue.');
      onNavigate('login', { email: verifyEmailInput });
    } catch (err) {
      onError(err.message || 'Email verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <InputField label="Email" type="email" value={verifyEmailInput} onChange={(e) => setVerifyEmailInput(e.target.value)} required />
      <InputField label="Code" value={verifyCodeInput} onChange={(e) => setVerifyCodeInput(e.target.value)} required maxLength={6} style={{ textAlign: 'center', letterSpacing: '0.2em' }} />
      <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
        {isSubmitting ? 'Verifying...' : 'Verify Code'}
      </Button>
    </form>
  );
}
