import React from 'react';
import FilterRulePill, { OperatorOption, ValueOption } from '../components/FilterRulePill/FilterRulePill';

export function FacilityFilter({ 
  value, 
  onChange,
  availableFacilities 
}: { 
  value?: string[]; 
  onChange: (value: string[]) => void;
  availableFacilities: string[];
}) {
  
  const operators: OperatorOption[] = [
    { id: 'is', label: 'Is' },
    { id: 'is-any-of', label: 'Is any of' }
  ];
  
  const values: ValueOption[] = availableFacilities.map(facility => ({
    id: facility,
    label: facility
  }));
  
  const currentOperator = value?.length === 1 ? 'is' : 'is-any-of';
  
  const handleOperatorChange = (operatorId: string) => {
    if (operatorId === 'is' && value && value.length > 1) {
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
      label="Facility"
      icon={<img src="/svg/View.svg" alt="Facility" style={{ width: '18px', height: '18px' }} />}
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