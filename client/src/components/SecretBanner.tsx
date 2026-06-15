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
      onClick={onDismiss}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 99997,
        background: 'var(--am)',
        color: '#000',
        padding: '10px 20px',
        fontFamily: "'VT323', monospace",
        fontSize: '16px',
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: 0,
      }}
    >
      {message}
    </div>
  );
};

export default SecretBanner;
