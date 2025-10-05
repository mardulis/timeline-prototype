import React from 'react';

interface ChevronUpProps {
  width?: number;
  height?: number;
  color?: string;
}

export const ChevronUp: React.FC<ChevronUpProps> = ({ 
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
      d="M12.5 8.3999L8.5 4.3999L4.5 8.3999" 
      stroke={color} 
      strokeWidth="1.25" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default ChevronUp;
