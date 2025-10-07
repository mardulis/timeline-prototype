import React from 'react';

// Flexible configuration types
export interface FilterField {
  id: string;
  label: string;
  icon?: React.ReactNode;
  operators: FilterOperator[];
  valueType: 'single' | 'multi' | 'text' | 'date' | 'number';
  values?: FilterValue[]; // For dropdown options
}

export interface FilterOperator {
  id: string;
  label: string;
}

export interface FilterValue {
  id: string;
  label: string;
}

export interface FilterPillProps {
  // Configuration
  availableFields: FilterField[];
  
  // Current state
  selectedFieldId?: string;
  selectedOperatorId?: string;
  selectedValueIds?: string[];
  
  // Callbacks
  onFieldChange?: (fieldId: string) => void;
  onOperatorChange?: (operatorId: string) => void;
  onValueChange?: (valueIds: string[]) => void;
  onRemove?: () => void;
  
  // Display helpers
  placeholderText?: string; // Default: "Select value"
}

// Menu component types
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface FilterMenuProps {
  // Content
  items: MenuItem[];
  
  // Selection mode
  mode: 'single' | 'multi';
  selectedIds: string[];
  
  // Callbacks
  onSelectionChange: (selectedIds: string[]) => void;
  
  // Popover state
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Customization
  width?: string; // Default: "250px"
  placeholder?: string;
  closeOnSelect?: boolean; // Default: true for single, false for multi
  anchorRef: React.RefObject<HTMLElement | null>; // Reference to the element that anchors the menu
}
