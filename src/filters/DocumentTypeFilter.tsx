import React from 'react';
import { Popover } from '../design-system/adapters';
import { QuickFilterButton } from './shared/FilterChip';
import FilterRulePill, { OperatorOption, ValueOption } from '../components/FilterRulePill/FilterRulePill';
import SelectMenu from '../components/SelectMenu';

export function DocumentTypeFilter({ 
  value, 
  onChange,
  availableTypes 
}: { 
  value?: string[]; 
  onChange: (value: string[]) => void;
  availableTypes: string[];
}) {
  
  const operators: OperatorOption[] = [
    { id: 'is', label: 'Is' },
    { id: 'is-any-of', label: 'Is any of' }
  ];
  
  const values: ValueOption[] = availableTypes.map(type => ({
    id: type,
    label: type
  }));
  
  const currentOperator = value?.length === 1 ? 'is' : 'is-any-of';
  const currentValue = value?.length === 1 ? value[0] : null;
  
  const handleOperatorChange = (operatorId: string) => {
    if (operatorId === 'is' && value && value.length > 1) {
      // If switching to single selection, keep only the first item
      onChange([value[0]]);
    }
  };
  
  const handleValueChange = (valueId: string | null) => {
    if (valueId) {
      if (currentOperator === 'is') {
        onChange([valueId]);
      } else {
        // For 'is-any-of', add to existing values or create new array
        const currentValues = value || [];
        if (!currentValues.includes(valueId)) {
          onChange([...currentValues, valueId]);
        }
      }
    } else {
      onChange([]);
    }
  };
  
  const handleClear = () => {
    onChange([]);
  };
  
  const hasValue = (value?.length || 0) > 0;
  
  // If filter is active, show as pill
  if (hasValue) {
    return (
      <FilterRulePill
        label="Doc Type"
        operators={operators}
        values={values}
        operator={currentOperator}
        value={currentValue}
        onOperatorChange={handleOperatorChange}
        onValueChange={(id) => handleValueChange(Array.isArray(id) ? id[0] || null : id)}
        multiple={false}
        onClear={handleClear}
      />
    );
  }
  
  // Show as quick filter button
  return (
    <Popover
      id="doc-type-filter"
      trigger={
        <QuickFilterButton>
          <img src="/svg/profile.svg" alt="Document Type" width="16" height="16" />
          Doc Type
        </QuickFilterButton>
      }
    >
      <SelectMenu
        items={availableTypes.map(type => ({
          id: type,
          label: type
        }))}
        value={value || []}
        onChange={(newValue: string[] | string | null) => onChange(Array.isArray(newValue) ? newValue : [])}
        selectionMode="multiple"
        showSearch={true}
        searchPlaceholder="Search document types..."
        title="Document Types"
      />
    </Popover>
  );
}