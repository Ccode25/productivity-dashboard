import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { InputField } from '../common/FormField';
import Button from '../common/Button';

export default function ForgotPasswordForm({ onSuccess, onError, onNavigate, initialEmail = '' }) {
  const { requestPasswordReset } = useAuth();
  const [forgotEmail, setForgotEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) setForgotEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!forgotEmail.includes('@')) return onError('Please enter a valid email address.');
    
    onError('');
    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(forgotEmail);
      onSuccess(res.message || 'Password reset token generated!');
      onNavigate('reset', { email: forgotEmail, token: res.token });
    } catch (err) {
      onError(err.message || 'Password reset request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <InputField label="Email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
      <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
        {isSubmitting ? 'Requesting...' : 'Request Reset'}
      </Button>
      <div style={{ textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={() => { onError(''); onNavigate('login'); }} 
          style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          Back to Login
        </button>
      </div>
    </form>
  );
}
