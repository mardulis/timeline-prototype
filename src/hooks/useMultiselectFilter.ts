import { useMemo } from 'react';

export interface MultiselectFilterConfig {
  label: string;
  icon: React.ReactNode;
  values: Array<{ id: string; label: string }>;
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  onClear: () => void;
  operators?: Array<{ id: string; label: string }>;
  onOperatorChange?: (operator: string) => void;
}

export function useMultiselectFilter(config: MultiselectFilterConfig) {
  const {
    label,
    icon,
    values,
    selectedValues,
    onValueChange,
    onClear,
    onOperatorChange,
    operators = [
      { id: 'is', label: 'Is' },
      { id: 'is-any-of', label: 'Is any of' }
    ]
  } = config;


  // Ensure selectedValues is always an array
  const normalizedSelectedValues = useMemo(() => {
    return Array.isArray(selectedValues) ? selectedValues : [];
  }, [selectedValues]);

  // Generate stable key (don't include selected values to avoid remounting)
  const filterKey = useMemo(() => {
    return `${label.toLowerCase().replace(/\s+/g, '-')}`;
  }, [label]);

  // Value calculation that matches Medical Entity pattern
  const filterValue = useMemo(() => {
    return normalizedSelectedValues;
  }, [normalizedSelectedValues]);

  // Handle value changes with automatic operator switching
  const handleValueChange = (value: string[] | string | null) => {
    let newValues: string[] = [];
    
    if (Array.isArray(value)) {
      newValues = value;
    } else if (value !== null) {
      newValues = [value];
    } else {
      newValues = [];
    }
    
    // Auto-switch operator based on number of selected values
    const newCount = newValues.length;
    if (newCount === 1 && onOperatorChange) {
      onOperatorChange('is');
    } else if (newCount > 1 && onOperatorChange) {
      onOperatorChange('is-any-of');
    }
    
    onValueChange(newValues);
  };

  return {
    key: filterKey,
    label,
    icon,
    operators,
    values,
    value: filterValue,
    defaultValue: [],
    multiple: true,
    onValueChange: handleValueChange,
    onClear
  };
}
