import React from 'react';

// DHARMA Initiative station logos as SVG components
export const DharmaLogos = {
  // Main DHARMA Initiative logo
  main: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <path d="M60 60 L140 60 L140 140 L60 140 Z" fill="none" stroke="white" strokeWidth="5" />
      <path d="M40 40 L160 160" stroke="white" strokeWidth="5" />
      <path d="M40 160 L160 40" stroke="white" strokeWidth="5" />
      <circle cx="100" cy="100" r="20" fill="white" />
    </svg>
  ),

  // The Swan - Station 3 (electromagnetic research)
  swan: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <path d="M100 30 C130 80, 130 120, 100 170 C70 120, 70 80, 100 30" fill="white" />
      <circle cx="100" cy="100" r="20" fill="black" />
    </svg>
  ),

  // The Pearl - Station 5 (observation)
  pearl: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="5" />
      <circle cx="100" cy="100" r="10" fill="white" />
    </svg>
  ),

  // The Flame - Station 4 (communications)
  flame: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <path d="M80 50 L120 50 L120 150 L80 150 Z" fill="white" />
      <path d="M60 70 L140 70 L140 130 L60 130 Z" fill="black" />
      <path d="M100 30 L100 170" stroke="white" strokeWidth="5" />
    </svg>
  ),

  // The Arrow - Station 1 (defense)
  arrow: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <path d="M50 100 L150 100 L100 50 Z" fill="white" />
      <path d="M50 100 L150 100 L100 150 Z" fill="white" />
    </svg>
  ),

  // The Staff - Station 6 (medical)
  staff: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <rect x="80" y="50" width="40" height="100" fill="white" />
      <circle cx="100" cy="80" r="20" fill="black" />
      <path d="M70 120 L130 120" stroke="black" strokeWidth="5" />
    </svg>
  ),

  // The Orchid - Station 7 (time travel research)
  orchid: (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" fill="black" stroke="white" strokeWidth="5" />
      <path d="M80 60 C120 60, 120 60, 120 100 C120 140, 120 140, 80 140 C40 140, 40 140, 40 100 C40 60, 40 60, 80 60" fill="white" />
      <path d="M120 60 C160 60, 160 60, 160 100 C160 140, 160 140, 120 140" fill="none" stroke="white" strokeWidth="5" />
    </svg>
  )
};

export default DharmaLogos;
