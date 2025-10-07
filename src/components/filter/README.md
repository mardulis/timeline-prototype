# Flexible Filter Pill Components

A configuration-driven, flexible filter pill and dropdown menu system built with React and TypeScript.

## Features

- **Configuration-Driven**: All filter types, operators, and values are defined through configuration objects
- **Flexible Field Types**: Support for single-select, multi-select, text, date, and number input types
- **Interactive Dropdowns**: Click-to-open menus with checkboxes for multi-select
- **Accessible**: Full keyboard navigation and ARIA support
- **Customizable**: Easy to extend with new field types and operators
- **Type-Safe**: Full TypeScript support with comprehensive type definitions

## Components

### FilterPill
The main segmented control component with 4 sections: `[Field] [Operator] [Value] [X]`

### FilterMenu
Reusable dropdown menu component with support for single and multi-select modes

### FilterSegment
Individual clickable segment component with hover and active states

## Usage

### Basic Setup

```typescript
import { FilterPill, FilterField } from './components/filter';

// Define your filter configuration
const filterConfig: FilterField[] = [
  {
    id: 'assignee',
    label: 'Assignee',
    icon: <UserIcon />,
    operators: [
      { id: 'is', label: 'Is' },
      { id: 'is-not', label: 'Is not' },
      { id: 'is-any-of', label: 'Is any of' },
    ],
    valueType: 'multi',
    values: [
      { id: 'user1', label: 'John Doe' },
      { id: 'user2', label: 'Jane Smith' },
    ],
  },
];

// Use in your component
function MyComponent() {
  const [fieldId, setFieldId] = useState<string>();
  const [operatorId, setOperatorId] = useState<string>();
  const [valueIds, setValueIds] = useState<string[]>([]);

  return (
    <FilterPill
      availableFields={filterConfig}
      selectedFieldId={fieldId}
      selectedOperatorId={operatorId}
      selectedValueIds={valueIds}
      onFieldChange={setFieldId}
      onOperatorChange={setOperatorId}
      onValueChange={setValueIds}
      onRemove={() => {
        setFieldId(undefined);
        setOperatorId(undefined);
        setValueIds([]);
      }}
    />
  );
}
```

### Configuration Types

```typescript
interface FilterField {
  id: string;
  label: string;
  icon?: React.ReactNode;
  operators: FilterOperator[];
  valueType: 'single' | 'multi' | 'text' | 'date' | 'number';
  values?: FilterValue[];
}

interface FilterOperator {
  id: string;
  label: string;
}

interface FilterValue {
  id: string;
  label: string;
}
```

## Design Specifications

### Visual Design
- **Background**: White with gray-200 borders
- **Border Radius**: 10px on outer edges
- **Shadow**: `0px 1px 4px 0px rgba(12,12,13,0.05)`
- **Font**: Switzer Medium, 13px
- **Padding**: 6px vertical, 10px horizontal per segment

### States
- **Default**: White background
- **Hover**: Gray-100 background on individual segments
- **Active**: Gray-200 background when dropdown is open
- **Empty**: Gray placeholder text "Select value"

### Interactive Behavior
- **Field Segment**: Opens field selector dropdown
- **Operator Segment**: Opens operator dropdown (disabled until field selected)
- **Value Segment**: Opens value selector dropdown (disabled until operator selected)
- **Remove Button**: Removes the entire filter pill

## Examples

### Single Select Field
```typescript
{
  id: 'status',
  label: 'Status',
  valueType: 'single',
  values: [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ],
}
```

### Multi Select Field
```typescript
{
  id: 'tags',
  label: 'Tags',
  valueType: 'multi',
  values: [
    { id: 'urgent', label: 'Urgent' },
    { id: 'bug', label: 'Bug' },
    { id: 'feature', label: 'Feature' },
  ],
}
```

### Text Input Field
```typescript
{
  id: 'search',
  label: 'Search',
  valueType: 'text',
  // No values array needed for text input
}
```

## Accessibility

- **Keyboard Navigation**: Full Tab, Enter, and Escape key support
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Clear focus indicators and management
- **Screen Reader Support**: Descriptive labels and state announcements

## File Structure

```
/components/filter/
├── FilterPill.tsx          # Main pill component
├── FilterMenu.tsx          # Dropdown menu component
├── FilterSegment.tsx       # Individual segment component
├── types.ts               # TypeScript type definitions
├── index.ts               # Export file
├── FilterPillDemo.tsx     # Comprehensive demo
└── FilterPillTest.tsx     # Simple test component
```

## Testing Checklist

- [x] Click field segment opens field dropdown
- [x] Click operator segment opens operator dropdown  
- [x] Click value segment opens value dropdown with checkboxes
- [x] Selecting items in dropdown updates pill value
- [x] Pill shows "Select value" placeholder when empty
- [x] Hover states work on all segments
- [x] Close button removes pill
- [x] Multiple selections show count (e.g., "2 assignee")
- [x] Keyboard navigation works
- [x] Clicking outside closes dropdown

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.0+
