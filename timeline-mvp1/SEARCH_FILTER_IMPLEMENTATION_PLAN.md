# Search & Filter Implementation Plan

## 🎯 Current State (SOLID VERSION - BACKUP CREATED)

### Backup Information
- **Backup Branch**: `pre-search-filter-backup`
- **Backup Commit**: `bb4fe02` - "Update minimap hover states and bar colors"
- **Backup Date**: Created before search/filter implementation
- **GitHub URL**: https://github.com/mardulis/timeline-prototype/tree/pre-search-filter-backup

### Current Features (Working Perfectly)
✅ **Multi-scale Timeline Views**: Year, Month, Day perspectives  
✅ **Interactive Minimaps**: Navigate through time periods with hover states  
✅ **Document Preview Panel**: View document details without losing context  
✅ **Smart Scrolling**: Intelligent horizontal and vertical scrolling  
✅ **CSV Data Loading**: Loads documents from CSV files  
✅ **PDF Viewer**: Integrated PDF viewing with custom toolbar  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Consistent Styling**: All minimap labels have hover states  
✅ **Custom SVG Icons**: Professional toolbar with proper icons  
✅ **48px Toolbar Height**: Perfect layout and spacing  

### Current Data Structure
```typescript
interface Doc {
  id: string;
  title: string;
  date: string; // ISO string
  docType: string;
  author?: string;
  facility?: string;
  pages?: number;
  summary?: string;
  medications?: string[];
  diagnoses?: string[];
  labs?: string[];
}
```

### Current Component Architecture
- `TimelineDashboard.tsx` - Main container component
- `CalendarArea.tsx` - Handles timeline visualization and scrolling
- `SearchAndControls.tsx` - Current navigation controls
- `DocumentPreview.tsx` - Shows document details in sidebar
- `LeftSidebar.tsx` - Mode selection and CSV loading
- View components: `YearView.tsx`, `MonthView.tsx`, `DayView.tsx`
- Minimap components: `YearlyMinimap.tsx`, `MonthlyMinimap.tsx`, `DailyMinimap.tsx`

---

## 🚀 Implementation Plan: Design-System-Ready Search & Filter

### Goal
Implement comprehensive Search and Filter system that:
1. Provides real-time, debounced text search and advanced multi-criteria filters
2. Uses reusable, tokenized, Design-System-ready components
3. Is highly performant, responsive, and accessible
4. Prepares codebase for Figma DS sync (Chromatic)
5. Allows future migration by swapping adapters

### Tech Stack
- **Framework**: React 19 + TypeScript
- **Styling**: styled-components
- **Build Tool**: Create React App (Vite migration ready)
- **State Management**: React hooks + context
- **Storybook + Chromatic**: For design QA and DS sync
- **Design Tokens**: Style Dictionary + Figma Tokens Studio

---

## 📂 New Directory Structure

```
src/
  design-system/
    tokens/
      css-vars.css          # Base design language in CSS variables
      index.ts              # TypeScript token exports
      themes/light.ts       # Light theme tokens
      themes/dark.ts        # Dark theme tokens
    foundations/
      GlobalStyle.tsx       # Global styles using tokens
      Typography.tsx        # Typography system
    primitives/
      Box.tsx              # Layout primitive
      Text.tsx             # Text primitive
      Heading.tsx          # Heading primitive
      Button.tsx           # Button component
      IconButton.tsx       # Icon button component
      TextField.tsx        # Input field component
      Select.tsx           # Select dropdown component
      Chip.tsx             # Filter chip component
      Checkbox.tsx         # Checkbox component
      TagInput.tsx         # Tag input component
      Popover.tsx          # Popover component
      Menu.tsx             # Menu component
      Surface.tsx          # Surface/container component
      Divider.tsx          # Divider component
    adapters/
      index.ts             # Re-exports primitives for future DS replacement
  features/search/
    SearchCtx.tsx          # Search context provider
    useSearchIndex.ts      # Search indexing hook
    utils.ts               # Search utilities
    highlight.ts           # Search highlighting
  filters/
    FilterBar.tsx          # Main filter bar component
    SearchInput.tsx        # Debounced search input
    DateFilter.tsx         # Date range filter
    FlaggedFilter.tsx      # Flagged documents filter
    MedicalEntityFilter.tsx # Medical entities filter
    MoreFilters.tsx        # Additional filters dropdown
    FilterChip.tsx         # Individual filter chip
  stories/
    primitives/            # Storybook stories for primitives
      Button.stories.tsx
      TextField.stories.tsx
      Chip.stories.tsx
      # ... other primitive stories
```

---

## 🧱 Design System Foundation

### 1. Design Tokens (css-vars.css)
```css
:root {
  --ds-bg: #ffffff;
  --ds-bg-subtle: #f9fafb;
  --ds-surface: #ffffff;
  --ds-fg: #0f172a;
  --ds-muted: #6b7280;
  --ds-border: #e5e7eb;
  --ds-primary: #1f2937;
  --ds-accent: #2563eb;
  --ds-danger: #ef4444;
  --ds-focus: #3b82f6;

  --ds-radius-sm: 6px;
  --ds-radius-md: 10px;
  --ds-radius-lg: 12px;
  --ds-radius-pill: 999px;

  --ds-space-1: 4px;
  --ds-space-2: 8px;
  --ds-space-3: 12px;
  --ds-space-4: 16px;
  --ds-space-5: 20px;

  --ds-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --ds-shadow-md: 0 2px 8px rgba(0,0,0,.08);

  --ds-font-body: Inter, system-ui, sans-serif;
  --ds-fs-sm: 13px;
  --ds-fs-md: 14px;
  --ds-fs-lg: 16px;
  --ds-fs-xl: 18px;
  --ds-lh-normal: 1.45;
}
```

### 2. TypeScript Tokens
```typescript
export const tokens = {
  color: {
    bg: 'var(--ds-bg)',
    surface: 'var(--ds-surface)',
    fg: 'var(--ds-fg)',
    muted: 'var(--ds-muted)',
    border: 'var(--ds-border)',
    primary: 'var(--ds-primary)',
    accent: 'var(--ds-accent)',
    danger: 'var(--ds-danger)',
    focus: 'var(--ds-focus)',
  },
  radius: { 
    sm: 'var(--ds-radius-sm)', 
    md: 'var(--ds-radius-md)', 
    lg: 'var(--ds-radius-lg)', 
    pill: 'var(--ds-radius-pill)' 
  },
  space: { 
    1: 'var(--ds-space-1)', 
    2: 'var(--ds-space-2)', 
    3: 'var(--ds-space-3)', 
    4: 'var(--ds-space-4)', 
    5: 'var(--ds-space-5)' 
  },
  shadow: { 
    sm: 'var(--ds-shadow-sm)', 
    md: 'var(--ds-shadow-md)' 
  },
  font: { body: 'var(--ds-font-body)' },
  fs: { 
    sm: 'var(--ds-fs-sm)', 
    md: 'var(--ds-fs-md)', 
    lg: 'var(--ds-fs-lg)' 
  },
  lh: { normal: 'var(--ds-lh-normal)' },
};
```

---

## 🎨 Design-System-Ready Primitives

### Button Component
```typescript
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--ds-radius-lg);
  border: 1px solid transparent;
  padding: ${p => p.size === 'sm' ? '6px 10px' : '8px 14px'};
  font-size: var(--ds-fs-md);
  background: ${p => p.variant === 'primary' ? 'var(--ds-primary)' : 'var(--ds-bg)'};
  color: ${p => p.variant === 'primary' ? '#fff' : 'var(--ds-fg)'};
  &:hover { filter: brightness(0.98); }
  &:focus-visible { outline: 2px solid var(--ds-focus); outline-offset: 2px; }
`;
```

### TextField Component
```typescript
export const TextField = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--ds-radius-lg);
  border: 1px solid var(--ds-border);
  background: var(--ds-bg);
  &::placeholder { color: var(--ds-muted); }
  &:focus-visible { outline: 2px solid var(--ds-focus); }
`;
```

### Chip Component
```typescript
export const Chip = styled.button<{ selected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--ds-radius-pill);
  border: 1px solid var(--ds-border);
  background: ${p => p.selected ? '#eef2ff' : 'var(--ds-bg-subtle)'};
  &:hover { background: #eef2f7; }
`;
```

---

## 🧩 Search & Filter Implementation

### Search Context
```typescript
// features/search/SearchCtx.tsx
export const SearchCtx = React.createContext(null);

export function SearchProvider({ docs, children }) {
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({});
  const filtered = React.useMemo(() => 
    applyFilters(docs, query, filters), 
    [docs, query, filters]
  );
  
  return (
    <SearchCtx.Provider value={{ query, setQuery, filters, setFilters, results: filtered }}>
      {children}
    </SearchCtx.Provider>
  );
}
```

### Debounced Search Input
```typescript
export function SearchInput({ value, onChange }: { 
  value: string; 
  onChange: (v: string) => void 
}) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => onChange(v), 250);
    return () => clearTimeout(t);
  }, [v]);
  
  return (
    <TextField 
      value={v} 
      onChange={e => setV(e.target.value)} 
      placeholder="Search documents..." 
    />
  );
}
```

### Filter Bar
```typescript
export function FilterBar({ query, onQuery, filters, setFilters, count }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <SearchInput value={query} onChange={onQuery} />
        <Button variant="secondary">Filters</Button>
        <span style={{ color: 'var(--ds-muted)' }}>
          Showing <b>{count}</b>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <DateFilter 
          value={filters.date} 
          onChange={v => setFilters({ ...filters, date: v })} 
        />
        <FlaggedFilter 
          value={filters.flagged} 
          onChange={v => setFilters({ ...filters, flagged: v })} 
        />
        <MedicalEntityFilter 
          value={filters.medical} 
          onChange={v => setFilters({ ...filters, medical: v })} 
        />
      </div>
    </div>
  );
}
```

---

## 🚀 Performance & Accessibility

### Performance Optimizations
✅ **Debounce input** (250ms)  
✅ **Memoize filtering logic**  
✅ **Lazy-load document previews**  
✅ **Virtual scroll for large datasets**  
✅ **Search indexing for fast queries**  

### Accessibility Features
✅ **Popovers close on Esc/outside click**  
✅ **Keyboard shortcut: Cmd/Ctrl + K focuses search**  
✅ **Chips and buttons accessible with aria-labels**  
✅ **Focus management for filter interactions**  
✅ **Screen reader friendly filter states**  

---

## 🧱 Design System Adapter Layer

### Adapter Pattern
```typescript
// adapters/index.ts
export { Button } from '../primitives/Button';
export { TextField } from '../primitives/TextField';
export { Chip } from '../primitives/Chip';
export { Popover } from '../primitives/Popover';
```

**Future Migration**: Replace with imports from `@wisedocs/ds-react` or Figma DS equivalents.

---

## 🧰 Storybook + Chromatic Integration

### Story Example
```typescript
// stories/Button.stories.tsx
import { Button } from '../../design-system/primitives/Button';

export default { 
  title: 'DS/Button', 
  parameters: { 
    design: { 
      type: 'figma', 
      url: 'https://www.figma.com/file/...' 
    } 
  } 
};

export const Variants = () => (
  <>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="danger">Danger</Button>
  </>
);
```

---

## 🧩 App Integration

### Main App Integration
```typescript
// App.tsx
import './design-system/tokens/css-vars.css';
import { GlobalStyle } from './design-system/foundations/GlobalStyle';
import { SearchProvider } from './features/search/SearchCtx';
import { FilterBar } from './filters/FilterBar';

export function App({ docs }) {
  return (
    <>
      <GlobalStyle />
      <SearchProvider docs={docs}>
        <FilterBar />
        <CalendarArea /> {/* renders filtered results */}
      </SearchProvider>
    </>
  );
}
```

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] **Text Search**: Real-time search on document titles with highlighting
- [ ] **Advanced Filters**: Doc Type, Author, Facility, Date, Medications, Diagnoses, Labs, Summary
- [ ] **Filter Combinations**: Multiple filters work together (AND logic)
- [ ] **Performance**: Handle 1000+ documents efficiently
- [ ] **Integration**: Seamless integration with existing timeline/minimap

### Design System Requirements
- [ ] **Tokenized Components**: All UI uses design tokens
- [ ] **DS-Ready**: Components can be swapped via adapters
- [ ] **Storybook**: All primitives have stories
- [ ] **Chromatic**: Connected to Figma DS
- [ ] **Accessibility**: Full keyboard navigation and screen reader support

### Technical Requirements
- [ ] **TypeScript**: Full type safety
- [ ] **Performance**: Debounced search, memoized filtering
- [ ] **State Management**: React Context for search/filter state
- [ ] **URL Integration**: Search/filter state in URL parameters
- [ ] **Backward Compatibility**: Existing functionality unchanged

---

## 🔄 Rollback Plan

If anything goes wrong during implementation:

1. **Switch to backup branch**:
   ```bash
   git checkout pre-search-filter-backup
   ```

2. **Reset main branch** (if needed):
   ```bash
   git checkout main
   git reset --hard pre-search-filter-backup
   git push origin main --force
   ```

3. **Restore from backup**:
   - All current functionality is preserved in `pre-search-filter-backup`
   - Timeline views, minimaps, PDF viewer, and navigation all working
   - No data loss or functionality regression

---

## 📋 Implementation Checklist

### Phase 1: Design System Foundation
- [ ] Create design tokens (CSS variables)
- [ ] Implement primitive components (Button, TextField, Chip, etc.)
- [ ] Set up adapter layer
- [ ] Create Storybook stories
- [ ] Test primitive components

### Phase 2: Search Implementation
- [ ] Create search context
- [ ] Implement debounced search input
- [ ] Add search highlighting
- [ ] Integrate with existing components
- [ ] Test search functionality

### Phase 3: Filter Implementation
- [ ] Create filter components (Date, Medical, etc.)
- [ ] Implement filter bar
- [ ] Add filter chips
- [ ] Integrate with search
- [ ] Test filter combinations

### Phase 4: Integration & Polish
- [ ] Integrate with timeline views
- [ ] Update minimap with filtered data
- [ ] Add URL state management
- [ ] Performance optimization
- [ ] Accessibility testing

### Phase 5: Documentation & Deployment
- [ ] Update documentation
- [ ] Create user guide
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Gather user feedback

---

## 🎯 Success Metrics

- **Performance**: Search results in <100ms for 1000+ documents
- **Usability**: Users can find documents 3x faster than before
- **Accessibility**: 100% keyboard navigation coverage
- **Design System**: All components tokenized and DS-ready
- **Maintainability**: Code is modular and easily extensible

---

*This document serves as the authoritative guide for implementing the Search & Filter system while preserving the current solid functionality.*
