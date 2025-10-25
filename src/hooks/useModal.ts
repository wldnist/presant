'use client';

import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: undefined
  });

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm?: () => void) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const hideModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: undefined
    }));
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideModal();
  };

  const showSuccess = (message: string, title: string = 'Berhasil', onConfirm?: () => void) => {
    showModal(title, message, 'success', onConfirm);
  };

  const showError = (message: string, title: string = 'Error', onConfirm?: () => void) => {
    showModal(title, message, 'error', onConfirm);
  };

  const showWarning = (message: string, title: string = 'Peringatan', onConfirm?: () => void) => {
    showModal(title, message, 'warning', onConfirm);
  };

  const showInfo = (message: string, title: string = 'Informasi', onConfirm?: () => void) => {
    showModal(title, message, 'info', onConfirm);
  };

  return {
    modalState,
    showModal,
    hideModal,
    handleConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
