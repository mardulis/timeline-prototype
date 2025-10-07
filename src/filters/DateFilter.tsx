import React from 'react';
import styled from 'styled-components';
import { Popover } from '../design-system/adapters';

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

export function DateFilter({ 
  value, 
  onChange 
}: { 
  value?: { start?: string; end?: string }; 
  onChange: (value: { start?: string; end?: string }) => void 
}) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, start: e.target.value });
  };
  
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, end: e.target.value });
  };
  
  const clearFilter = () => {
    onChange({});
  };
  
  const hasValue = value?.start || value?.end;
  
  // Format date range for display
  const formatDateRange = () => {
    if (!hasValue) return '';
    const start = value?.start ? new Date(value.start).toLocaleDateString() : '';
    const end = value?.end ? new Date(value.end).toLocaleDateString() : '';
    if (start && end) return `${start} - ${end}`;
    if (start) return `from ${start}`;
    if (end) return `until ${end}`;
    return '';
  };
  
  // If filter is active, show as pill
  if (hasValue) {
    return (
      <FilterChip isPill>
        <img src="/svg/calendar0321.svg" alt="Calendar" width="16" height="16" />
        <span>Date is {formatDateRange()}</span>
        <ClearButton onClick={clearFilter} aria-label="Clear date filter">
          ×
        </ClearButton>
      </FilterChip>
    );
  }
  
  // Show as quick filter button
  return (
    <Popover
      id="date-filter"
      trigger={
        <FilterChip>
          <img src="/svg/calendar0321.svg" alt="Calendar" width="16" height="16" />
          Date
        </FilterChip>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--ds-muted)', marginBottom: '4px', display: 'block' }}>
            Start Date
          </label>
          <input
            type="date"
            value={value?.start || ''}
            onChange={handleStartChange}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--ds-border)',
              borderRadius: 'var(--ds-radius-sm)',
              fontSize: 'var(--ds-fs-sm)'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--ds-muted)', marginBottom: '4px', display: 'block' }}>
            End Date
          </label>
          <input
            type="date"
            value={value?.end || ''}
            onChange={handleEndChange}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid var(--ds-border)',
              borderRadius: 'var(--ds-radius-sm)',
              fontSize: 'var(--ds-fs-sm)'
            }}
          />
        </div>
        {hasValue && (
          <button
            onClick={clearFilter}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              color: 'var(--ds-danger)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>
    </Popover>
  );
}
