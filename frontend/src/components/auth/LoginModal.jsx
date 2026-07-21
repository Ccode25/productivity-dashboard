import React from 'react';
import useAuth from '../../hooks/useAuth';
import Modal from '../common/Modal';
import AuthForms from './AuthForms';

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal } = useAuth();

  return (
    <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
      <AuthForms onSuccess={() => setShowLoginModal(false)} />
    </Modal>
  );
}
