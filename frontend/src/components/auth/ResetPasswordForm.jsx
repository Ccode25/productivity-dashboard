import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { InputField } from '../common/FormField';
import Button from '../common/Button';

export default function ResetPasswordForm({ onSuccess, onError, onNavigate, initialEmail = '', initialToken = '' }) {
  const { completePasswordReset } = useAuth();
  const [resetTokenInput, setResetTokenInput] = useState(initialToken);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialToken) setResetTokenInput(initialToken);
  }, [initialToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!resetTokenInput.trim()) return onError('Reset token is required.');
    if (resetNewPassword.length < 6) return onError('New password must be at least 6 characters long.');
    
    onError('');
    setIsSubmitting(true);
    try {
      const res = await completePasswordReset(resetTokenInput, resetNewPassword);
      onSuccess(res.message || 'Password reset successful! You can now log in.');
      onNavigate('login', { email: initialEmail });
    } catch (err) {
      onError(err.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <InputField label="Reset Token" value={resetTokenInput} onChange={(e) => setResetTokenInput(e.target.value)} required style={{ fontFamily: 'monospace' }} />
      <InputField label="New Password" type="password" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required minLength={6} />
      <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
        {isSubmitting ? 'Saving...' : 'Save Password'}
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
