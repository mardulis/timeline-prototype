import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
`;

const SearchField = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 14px;
  padding-right: 40px; /* Space for clear button */
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
  font-weight: 500;
  &::placeholder { color: #6b7280; }
  &:focus-visible { outline: 2px solid #3b82f6; }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--ds-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--ds-bg-subtle);
    color: var(--ds-fg);
  }
  
  &:focus-visible {
    outline: 2px solid var(--ds-focus);
    outline-offset: 2px;
  }
`;

export function SearchInput({ value, onChange }: { 
  value: string; 
  onChange: (v: string) => void 
}) {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 250);
    
    return () => clearTimeout(timer);
  }, [localValue, onChange]);
  
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  
  return (
    <SearchContainer>
      <SearchField 
        value={localValue} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value)} 
        placeholder="Search by keyword" 
      />
      {localValue && (
        <ClearButton onClick={handleClear} aria-label="Clear search">
          ×
        </ClearButton>
      )}
    </SearchContainer>
  );
}
