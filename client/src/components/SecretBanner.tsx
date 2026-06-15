import React, { useEffect } from 'react';

interface SecretBannerProps {
  message: string | null;
  onDismiss: () => void;
}

const SecretBanner: React.FC<SecretBannerProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      id="secBanner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 99997,
        background: 'var(--am)',
        color: '#000',
        padding: '8px 20px',
        fontFamily: "'VT323', monospace",
        fontSize: '16px',
        letterSpacing: 2,
        boxSizing: 'border-box',
      }}
    >
      {message}
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'VT323', monospace",
          fontSize: '16px',
          float: 'right',
          color: '#000',
        }}
      >
        [X]
      </button>
    </div>
  );
};

export default SecretBanner;
