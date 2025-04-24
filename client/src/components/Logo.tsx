import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'swan' | 'pearl' | 'flame' | 'arrow' | 'staff' | 'orchid' | 'dharma';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dharma', className = '' }) => {
  // Size mapping
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  // Render the appropriate SVG based on the variant
  const renderLogo = () => {
    switch (variant) {
      case 'swan':
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <path d="M50 15 C65 40, 65 60, 50 85 C35 60, 35 40, 50 15" fill="white" />
            <circle cx="50" cy="50" r="10" fill="black" />
          </svg>
        );
      case 'pearl':
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="3" />
            <circle cx="50" cy="50" r="5" fill="white" />
          </svg>
        );
      case 'flame':
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <path d="M40 25 L60 25 L60 75 L40 75 Z" fill="white" />
            <path d="M30 35 L70 35 L70 65 L30 65 Z" fill="black" />
            <path d="M50 15 L50 85" stroke="white" strokeWidth="3" />
          </svg>
        );
      case 'arrow':
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <path d="M25 50 L75 50 L50 25 Z" fill="white" />
            <path d="M25 50 L75 50 L50 75 Z" fill="white" />
          </svg>
        );
      case 'staff':
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <rect x="40" y="25" width="20" height="50" fill="white" />
            <circle cx="50" cy="40" r="10" fill="black" />
            <path d="M35 60 L65 60" stroke="black" strokeWidth="3" />
          </svg>
        );
      case 'orchid':
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <path d="M40 30 C60 30, 60 30, 60 50 C60 70, 60 70, 40 70 C20 70, 20 70, 20 50 C20 30, 20 30, 40 30" fill="white" />
            <path d="M60 30 C80 30, 80 30, 80 50 C80 70, 80 70, 60 70" fill="none" stroke="white" strokeWidth="3" />
          </svg>
        );
      case 'dharma':
      default:
        return (
          <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`}>
            <circle cx="50" cy="50" r="45" fill="black" stroke="white" strokeWidth="2" />
            <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="white" strokeWidth="3" />
            <path d="M20 20 L80 80" stroke="white" strokeWidth="3" />
            <path d="M20 80 L80 20" stroke="white" strokeWidth="3" />
            <circle cx="50" cy="50" r="10" fill="white" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="relative"
    >
      {renderLogo()}
    </motion.div>
  );
};

export default Logo;
