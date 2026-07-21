import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { InputField } from '../common/FormField';
import Button from '../common/Button';

export default function RegisterForm({ onSuccess, onError, onNavigate }) {
  const { registerUser } = useAuth();
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Developer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!regName.trim()) return onError('Full name is required.');
    if (!regEmail.includes('@')) return onError('A valid email address is required.');
    if (regPassword.length < 6) return onError('Password must be at least 6 characters long.');
    
    onError('');
    setIsSubmitting(true);
    try {
      const res = await registerUser(regName, regEmail, regPassword, regRole);
      onSuccess(`Account created! A 6-digit verification code (${res.verificationCode || '123456'}) has been generated.`);
      onNavigate('verify', { email: regEmail, code: res.verificationCode });
    } catch (err) {
      onError(err.message || 'Account registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <InputField label="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
      <InputField label="Email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
      <InputField label="Role" value={regRole} onChange={(e) => setRegRole(e.target.value)} />
      <InputField label="Password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} />
      <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '0.25rem' }}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
}
