'use client';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
}

export default function SimpleModal({ isOpen, onClose, onConfirm, onCancel, title, message, type = 'info' }: SimpleModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    const iconStyle = {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    };

    switch (type) {
      case 'success':
        return (
          <div style={{ ...iconStyle, backgroundColor: '#dcfce7' }}>
            <svg style={{ width: '24px', height: '24px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div style={{ ...iconStyle, backgroundColor: '#fef2f2' }}>
            <svg style={{ width: '24px', height: '24px', color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'confirm':
        return (
          <div style={{ ...iconStyle, backgroundColor: '#fef3c7' }}>
            <svg style={{ width: '24px', height: '24px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div style={{ ...iconStyle, backgroundColor: '#dbeafe' }}>
            <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };


  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          {getIcon()}
        </div>
        
        {/* Title */}
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '18px', 
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1f2937'
        }}>
          {title}
        </h3>
        
        {/* Message */}
        <p style={{ 
          margin: '0 0 20px 0', 
          color: '#6b7280',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {message}
        </p>
        
        {/* Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: type === 'confirm' ? 'space-between' : 'center' 
        }}>
          {type === 'confirm' && (
            <button
              onClick={onCancel || onClose}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Batal
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            style={{
              flex: type === 'confirm' ? 1 : 'none',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: type === 'confirm' ? '#dc2626' : '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
