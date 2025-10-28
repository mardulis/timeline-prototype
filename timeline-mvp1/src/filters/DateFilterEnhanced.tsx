import React from 'react';
import { Popover } from '../design-system/adapters';
import { QuickFilterButton } from './shared/FilterChip';
import FilterRulePill, { OperatorOption, ValueOption } from '../components/FilterRulePill/FilterRulePill';
import SelectMenu from '../components/SelectMenu';

export function DateFilter({ 
  value, 
  onChange 
}: { 
  value?: { start?: string; end?: string; operator?: string }; 
  onChange: (value: { start?: string; end?: string; operator?: string }) => void 
}) {
  
  const operators: OperatorOption[] = [
    { id: 'is', label: 'Is' },
    { id: 'before', label: 'Before' },
    { id: 'after', label: 'After' },
    { id: 'between', label: 'Between' }
  ];
  
  const predefinedValues: ValueOption[] = [
    { id: 'today', label: 'Today' },
    { id: 'last7days', label: 'Last 7 days' },
    { id: 'last30days', label: 'Last 30 days' },
    { id: 'thismonth', label: 'This month' },
    { id: 'lastmonth', label: 'Last month' },
    { id: 'thisyear', label: 'This year' },
    { id: 'lastyear', label: 'Last year' }
  ];
  
  const currentOperator = value?.operator || 'is';
  const currentValue = value?.start ? 'custom' : null; // For now, we'll use 'custom' for any custom date
  
  const handleOperatorChange = (operatorId: string) => {
    onChange({
      ...value,
      operator: operatorId
    });
  };
  
  const handleValueChange = (valueId: string | null) => {
    if (valueId) {
      // Handle predefined date values
      const today = new Date();
      let start: string | undefined;
      let end: string | undefined;
      
      switch (valueId) {
        case 'today':
          start = today.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
          break;
        case 'last7days':
          const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          start = last7Days.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
          break;
        case 'last30days':
          const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          start = last30Days.toISOString().split('T')[0];
          end = today.toISOString().split('T')[0];
          break;
        // Add more cases as needed
      }
      
      onChange({
        ...value,
        start,
        end
      });
    } else {
      onChange({
        ...value,
        start: undefined,
        end: undefined
      });
    }
  };
  
  const handleClear = () => {
    onChange({});
  };
  
  const hasValue = !!(value?.start || value?.end);
  
  // If filter is active, show as pill
  if (hasValue) {
    return (
      <FilterRulePill
        label="Date"
        operators={operators}
        values={predefinedValues}
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
      id="date-filter"
      trigger={
        <QuickFilterButton>
          <img src="/svg/calendar0321.svg" alt="Date" width="16" height="16" />
          Date
        </QuickFilterButton>
      }
    >
      <SelectMenu
        items={predefinedValues}
        value={currentValue ? [currentValue] : []}
        onChange={(newValue: string[] | string | null) => {
          const selectedValue = Array.isArray(newValue) ? newValue[0] : newValue;
          handleValueChange(selectedValue);
        }}
        selectionMode="single"
        showSearch={false}
        title="Date Range"
      />
    </Popover>
  );
}