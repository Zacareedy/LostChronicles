
import React from 'react';
import { motion } from 'framer-motion';

interface TapeSquareProps {
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const TapeSquare: React.FC<TapeSquareProps> = ({ isActive = false, onClick, className = '' }) => {
  return (
    <motion.div
      className={`w-16 h-16 border-2 cursor-pointer ${
        isActive 
          ? 'border-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-amber),0.2)]' 
          : 'border-[hsla(var(--dharma-gray),0.3)] hover:border-[hsla(var(--dharma-amber),0.5)]'
      } ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    />
  );
};

export default TapeSquare;
