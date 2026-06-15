import React, { useRef, useState } from 'react';

interface HiddenEyeProps {
  onFound: () => void;
}

const ASCII_EYE = ` /|\\
(0-0)
 \\_/`;

const HiddenEye: React.FC<HiddenEyeProps> = ({ onFound }) => {
  const eyeHit = useRef<boolean>(false);
  const [found, setFound] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (eyeHit.current) return;
    eyeHit.current = true;
    setFound(true);
    onFound();
  };

  const isAmber = found || hovered;

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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: '14px',
          lineHeight: 1.2,
          margin: 0,
          opacity: isAmber ? 0.9 : 0.22,
          color: isAmber ? 'var(--am)' : 'var(--ph-dim)',
          cursor: found ? 'default' : hovered ? 'pointer' : 'default',
          borderRadius: 0,
          transition: 'opacity 0.2s, color 0.2s',
        }}
      >
        {ASCII_EYE}
      </pre>
    </div>
  );
};

export default HiddenEye;
