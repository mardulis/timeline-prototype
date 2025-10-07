import styled from 'styled-components';

// Quick filter button - simple button style for inactive filters
export const QuickFilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

// Filter chip - for backward compatibility (deprecated, use QuickFilterButton)
export const FilterChip = styled.button<{ selected?: boolean; isPill?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: ${p => p.isPill ? '#e0f2fe' : '#ffffff'};
  color: ${p => p.isPill ? '#0369a1' : '#374151'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${p => p.isPill ? '#bae6fd' : '#f9fafb'};
    border-color: ${p => p.isPill ? '#bae6fd' : '#d1d5db'};
  }
  
  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

export const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: relative;
  
  &:hover {
    background: #f3f4f6;
  }
  
  /* Add vertical separator before the remove button */
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #e5e7eb;
  }
  
  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

// 3-part filter pill for active filters
export const FilterPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
`;

export const PillSection = styled.button<{ clickable?: boolean; pressed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  cursor: ${p => p.clickable ? 'pointer' : 'default'};
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  position: relative;
  
  &:hover {
    background: ${p => p.clickable ? '#f3f4f6' : 'transparent'};
  }
  
  /* Pressed state - same as hover when dropdown is open */
  ${p => p.pressed && p.clickable && `
    background: #f3f4f6;
  `}
  
  /* Add vertical separator after each section - spans full height */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #e5e7eb;
  }
  
  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;
