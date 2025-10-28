import React from 'react';
import FilterRulePill, { OperatorOption, ValueOption } from '../components/FilterRulePill/FilterRulePill';

export function AuthorFilter({ 
  value, 
  onChange,
  availableAuthors 
}: { 
  value?: string[]; 
  onChange: (value: string[]) => void;
  availableAuthors: string[];
}) {
  
  const operators: OperatorOption[] = [
    { id: 'is', label: 'Is' },
    { id: 'is-any-of', label: 'Is any of' }
  ];
  
  const values: ValueOption[] = availableAuthors.map(author => ({
    id: author,
    label: author
  }));
  
  const currentOperator = value?.length === 1 ? 'is' : 'is-any-of';
  
  const handleOperatorChange = (operatorId: string) => {
    if (operatorId === 'is' && value && value.length > 1) {
      // If switching to single selection, keep only the first item
      onChange([value[0]]);
    }
  };
  
  const handleValueChange = (valueIds: string[] | string | null) => {
    if (Array.isArray(valueIds)) {
      onChange(valueIds);
    } else if (typeof valueIds === 'string') {
      onChange([valueIds]);
    } else {
      onChange([]);
    }
  };
  
  const handleClear = () => {
    onChange([]);
  };
  
  return (
    <FilterRulePill
      label="Author"
      icon={<img src="/svg/profile.svg" alt="User" style={{ width: '18px', height: '18px' }} />}
      operators={operators}
      values={values}
      operator={currentOperator}
      value={value || []}
      multiple={true}
      onOperatorChange={handleOperatorChange}
      onValueChange={handleValueChange}
      onClear={handleClear}
    />
  );
}