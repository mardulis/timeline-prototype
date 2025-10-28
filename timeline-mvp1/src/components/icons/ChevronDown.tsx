import React from 'react';

interface ChevronDownProps {
  width?: number;
  height?: number;
  color?: string;
}

export const ChevronDown: React.FC<ChevronDownProps> = ({ 
  width = 16, 
  height = 16, 
  color = "#1F2937" 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 17 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12.5 7.6001L8.5 11.6001L4.5 7.6001" 
      stroke={color} 
      strokeWidth="1.25" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default ChevronDown;
