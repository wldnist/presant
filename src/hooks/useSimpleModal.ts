'use client';

import { useState } from 'react';

interface SimpleModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useSimpleModal() {
  const [modalState, setModalState] = useState<SimpleModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: undefined,
    onCancel: undefined
  });

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info', onConfirm?: () => void, onCancel?: () => void) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      onCancel
    });
  };

  const hideModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: undefined,
      onCancel: undefined
    }));
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideModal();
  };

  const handleCancel = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    hideModal();
  };

  const showSuccess = (message: string, title: string = 'Berhasil', onConfirm?: () => void) => {
    showModal(title, message, 'success', onConfirm);
  };

  const showError = (message: string, title: string = 'Error', onConfirm?: () => void) => {
    showModal(title, message, 'error', onConfirm);
  };

  const showConfirm = (message: string, title: string = 'Konfirmasi', onConfirm?: () => void, onCancel?: () => void) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      onCancel
    });
  };

  return {
    modalState,
    showModal,
    hideModal,
    handleConfirm,
    handleCancel,
    showSuccess,
    showError,
    showConfirm
  };
}
