import React, { useState, useRef } from 'react';
import { FilterPillProps, MenuItem } from './types';
import { FilterMenu } from './FilterMenu';

export const FilterPill: React.FC<FilterPillProps> = ({
  availableFields,
  selectedFieldId,
  selectedOperatorId,
  selectedValueIds = [],
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onRemove,
  placeholderText = "Select value"
}) => {
  const [activeSegment, setActiveSegment] = useState<'operator' | 'value' | null>(null);

  const operatorRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef<HTMLButtonElement>(null);

  const selectedField = availableFields.find(f => f.id === selectedFieldId);
  const selectedOperator = selectedField?.operators.find(op => op.id === selectedOperatorId);
  const selectedValues = selectedField?.values?.filter(v => selectedValueIds.includes(v.id)) || [];

  const handleOperatorClick = () => setActiveSegment(prev => prev === 'operator' ? null : 'operator');
  const handleValueClick = () => setActiveSegment(prev => prev === 'value' ? null : 'value');

  const handleOperatorSelection = (ids: string[]) => {
    onOperatorChange?.(ids[0]);
    setActiveSegment(null);
  };

  const handleValueSelection = (ids: string[]) => {
    onValueChange?.(ids);
    // If single select, close the menu
    if (selectedField?.valueType === 'single') {
      setActiveSegment(null);
    }
  };

  const operatorMenuItems: MenuItem[] = selectedField?.operators.map(op => ({
    id: op.id,
    label: op.label
  })) || [];

  const valueMenuItems: MenuItem[] = selectedField?.values?.map(val => ({
    id: val.id,
    label: val.label
  })) || [];

  const getValueDisplayText = () => {
    if (!selectedField) return placeholderText;
    if (selectedValues.length === 0) return placeholderText;
    if (selectedField.valueType === 'multi') {
      return `${selectedValues.length} ${selectedField.label.toLowerCase()}${selectedValues.length !== 1 ? 's' : ''}`;
    }
    return selectedValues.map(v => v.label).join(', ');
  };

  return (
    <>
      <div
        role="group"
        aria-label="Filter"
        style={{
          position: 'relative',
          display: 'inline-flex',
          height: '44px',
          alignItems: 'center',
          borderRadius: '22px',
          border: '1px solid var(--stroke)',
          background: 'var(--bg)',
          padding: '0 8px',
          overflow: 'hidden',
          minWidth: '0'
        }}
        data-filter-pill
      >
        {/* Field Display (non-interactive) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            userSelect: 'none',
            flexShrink: '0'
          }}
        >
          {selectedField?.icon && (
            <span style={{
              height: '18px',
              width: '18px',
              opacity: '0.8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: '0'
            }}>
              {selectedField.icon}
            </span>
          )}
          <span style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--text)'
          }}>
            {selectedField?.label || 'Select field'}
          </span>
        </div>

        {/* Operator Segment */}
        <button
          ref={operatorRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={activeSegment === 'operator'}
          data-open={activeSegment === 'operator'}
          disabled={!selectedField}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: '0',
            boxShadow: 'none',
            height: '100%',
            padding: '0 16px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--text)',
            minWidth: '0',
            cursor: selectedField ? 'pointer' : 'not-allowed',
            opacity: selectedField ? '1' : '0.5'
          }}
          onClick={handleOperatorClick}
          onMouseEnter={(e) => {
            if (selectedField) {
              e.currentTarget.style.background = 'var(--hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSegment !== 'operator') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <span style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {selectedOperator?.label || 'Select operator'}
          </span>
        </button>

        {/* Value Segment */}
        <button
          ref={valueRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={activeSegment === 'value'}
          data-open={activeSegment === 'value'}
          disabled={!selectedField || !selectedOperator}
          style={{
            appearance: 'none',
            background: 'transparent',
            border: '0',
            boxShadow: 'none',
            height: '100%',
            padding: '0 16px',
            fontSize: '15px',
            fontWeight: '500',
            color: 'var(--text)',
            minWidth: '0',
            cursor: (selectedField && selectedOperator) ? 'pointer' : 'not-allowed',
            opacity: (selectedField && selectedOperator) ? '1' : '0.5'
          }}
          onClick={handleValueClick}
          onMouseEnter={(e) => {
            if (selectedField && selectedOperator) {
              e.currentTarget.style.background = 'var(--hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSegment !== 'value') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title={getValueDisplayText()}
        >
          <span style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {getValueDisplayText()}
          </span>
        </button>

        {/* Remove Button */}
        <button
          type="button"
          style={{
            appearance: 'none',
            background: 'transparent',
            border: '0',
            boxShadow: 'none',
            height: '100%',
            padding: '0 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={onRemove}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <img src="/svg/Close.svg" alt="Remove" style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      {/* Operator Menu */}
      {activeSegment === 'operator' && (
        <FilterMenu
          items={operatorMenuItems}
          mode="single"
          selectedIds={selectedOperatorId ? [selectedOperatorId] : []}
          onSelectionChange={handleOperatorSelection}
          open={true}
          onOpenChange={(open) => !open && setActiveSegment(null)}
          width="150px"
          anchorRef={operatorRef}
        />
      )}

      {/* Value Menu */}
      {activeSegment === 'value' && (
        <FilterMenu
          items={valueMenuItems}
          mode={selectedField?.valueType === 'multi' ? 'multi' : 'single'}
          selectedIds={selectedValueIds}
          onSelectionChange={handleValueSelection}
          open={true}
          onOpenChange={(open) => !open && setActiveSegment(null)}
          width="250px"
          closeOnSelect={selectedField?.valueType === 'single'}
          anchorRef={valueRef}
        />
      )}
    </>
  );
};