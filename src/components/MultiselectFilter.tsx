import React from 'react';
import FilterRulePill from './FilterRulePill/FilterRulePill';
import { useMultiselectFilter, MultiselectFilterConfig } from '../hooks/useMultiselectFilter';

interface MultiselectFilterProps extends MultiselectFilterConfig {
  className?: string;
  style?: React.CSSProperties;
  openValueMenuInitially?: boolean; // New prop to control initial menu state
  onDropdownClose?: () => void; // New prop for dropdown close callback
}

export function MultiselectFilter(props: MultiselectFilterProps) {
  const filterProps = useMultiselectFilter(props);

  return (
    <FilterRulePill
      {...filterProps}
      className={props.className}
      style={props.style}
      openValueMenuInitially={props.openValueMenuInitially}
      onDropdownClose={props.onDropdownClose}
    />
  );
}

export default MultiselectFilter;
