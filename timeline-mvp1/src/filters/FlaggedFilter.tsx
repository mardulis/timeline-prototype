import React from 'react';
import styled from 'styled-components';

const FilterChip = styled.button<{ selected?: boolean; isPill?: boolean }>`
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

const ClearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

export function FlaggedFilter({ 
  value, 
  onChange 
}: { 
  value?: boolean; 
  onChange: (value: boolean | undefined) => void 
}) {
  const toggleFlagged = () => {
    onChange(!value);
  };
  
  const clearFilter = () => {
    onChange(undefined);
  };
  
  const hasValue = value === true;
  
  // If filter is active, show as pill
  if (hasValue) {
    return (
      <FilterChip isPill>
        <img src="/svg/flag.svg" alt="Flagged" width="16" height="16" />
        <span>Flagged is true</span>
        <ClearButton onClick={clearFilter} aria-label="Clear flagged filter">
          ×
        </ClearButton>
      </FilterChip>
    );
  }
  
  // Show as quick filter button
  return (
    <FilterChip onClick={toggleFlagged}>
      <img src="/svg/flag.svg" alt="Flagged" width="16" height="16" />
      Flagged
    </FilterChip>
  );
}
