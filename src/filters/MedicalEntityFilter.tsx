import React from 'react';
import { Popover } from '../design-system/adapters';
import { QuickFilterButton } from './shared/FilterChip';
import FilterRulePill, { OperatorOption, ValueOption } from '../components/FilterRulePill/FilterRulePill';
import SelectMenu from '../components/SelectMenu';

export function MedicalEntityFilter({ 
  value, 
  onChange 
}: { 
  value?: { medications?: string[]; diagnoses?: string[]; labs?: string[] }; 
  onChange: (value: { medications?: string[]; diagnoses?: string[]; labs?: string[] }) => void 
}) {
  
  const operators: OperatorOption[] = [
    { id: 'has', label: 'Has' },
    { id: 'has-any-of', label: 'Has any of' }
  ];
  
  // For now, we'll focus on diagnoses as the primary value
  // You can extend this to handle multiple entity types
  const diagnoses: ValueOption[] = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'asthma', label: 'Asthma' },
    { id: 'depression', label: 'Depression' },
    { id: 'anxiety', label: 'Anxiety' }
  ];
  
  const currentOperator = 'has';
  const currentValue = value?.diagnoses?.[0] || null;
  
  const handleOperatorChange = (operatorId: string) => {
    // For medical entities, we typically use 'has' operator
    // You can extend this logic as needed
  };
  
  const handleValueChange = (valueId: string | null) => {
    if (valueId) {
      onChange({
        ...value,
        diagnoses: [valueId]
      });
    } else {
      onChange({
        ...value,
        diagnoses: []
      });
    }
  };
  
  const handleClear = () => {
    onChange({
      ...value,
      diagnoses: []
    });
  };
  
  const hasValue = !!(value?.diagnoses?.length || value?.medications?.length || value?.labs?.length);
  
  // If filter is active, show as pill
  if (hasValue) {
    return (
      <FilterRulePill
        label="Medical Entity"
        operators={operators}
        values={diagnoses}
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
      id="medical-entity-filter"
      trigger={
        <QuickFilterButton>
          <img src="/svg/cells.svg" alt="Medical Entity" width="16" height="16" />
          Medical Entity
        </QuickFilterButton>
      }
    >
      <SelectMenu
        items={diagnoses}
        value={currentValue ? [currentValue] : []}
        onChange={(newValue: string[] | string | null) => {
          const selectedValue = Array.isArray(newValue) ? newValue[0] : newValue;
          handleValueChange(selectedValue);
        }}
        selectionMode="single"
        showSearch={true}
        searchPlaceholder="Search diagnoses..."
        title="Medical Entities"
      />
    </Popover>
  );
}