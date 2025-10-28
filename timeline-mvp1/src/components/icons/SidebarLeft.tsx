import React from 'react';

interface SidebarLeftProps {
  width?: number;
  height?: number;
  color?: string;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ 
  width = 16, 
  height = 16, 
  color = "#1F2937" 
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M1.3335 8C1.3335 5.54058 1.3335 4.31087 1.87604 3.43918C2.07676 3.11668 2.3261 2.83618 2.61277 2.61036C3.3876 2 4.48068 2 6.66683 2H9.3335C11.5196 2 12.6127 2 13.3876 2.61036C13.6742 2.83618 13.9236 3.11668 14.1243 3.43918C14.6668 4.31087 14.6668 5.54058 14.6668 8C14.6668 10.4594 14.6668 11.6891 14.1243 12.5608C13.9236 12.8833 13.6742 13.1638 13.3876 13.3897C12.6127 14 11.5196 14 9.3335 14H6.66683C4.48068 14 3.3876 14 2.61277 13.3897C2.3261 13.1638 2.07676 12.8833 1.87604 12.5608C1.3335 11.6891 1.3335 10.4594 1.3335 8Z" 
      stroke={color} 
      strokeWidth="1.25"
    />
    <path 
      d="M6.3335 2V14" 
      stroke={color} 
      strokeWidth="1.25" 
      strokeLinejoin="round"
    />
    <path 
      d="M3.3335 4.66675H4.00016M3.3335 6.66675H4.00016" 
      stroke={color} 
      strokeWidth="1.25" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default SidebarLeft;
