import React, { useState } from 'react';

interface HiddenEyeProps {
  onFound: () => void;
}

const ASCII_EYE = ` /|\\
(0-0)
 \\_/`;

const HiddenEye: React.FC<HiddenEyeProps> = ({ onFound }) => {
  const [eyeHit, setEyeHit] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleClick = () => {
    if (eyeHit) return;
    setEyeHit(true);
    onFound();
  };

  const isAmber = eyeHit || isHovered;

  return (
    <div
      id="eye"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 500,
      }}
    >
      <pre
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: '11px',
          lineHeight: 1.2,
          margin: 0,
          opacity: isAmber ? 0.9 : 0.22,
          color: isAmber ? 'var(--am)' : 'var(--ph-dim)',
          cursor: 'pointer',
        }}
      >
        {ASCII_EYE}
      </pre>
    </div>
  );
};

export default HiddenEye;
