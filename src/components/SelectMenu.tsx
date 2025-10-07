import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// CSS Variables for theming
const CSS_VARS = `
:root {
  --stroke: #E6EAF2;
  --hover: #F2F4F7;
  --active: #E7EAEE;
  --text: #0F172A;
  --muted: #98A2B3;
  --ring: #3B82F6;
}
`;

export type MenuItem = {
  id: string;
  label: string;
  keywords?: string;        // included in search
  disabled?: boolean;
};

type SelectionMode = 'multiple' | 'single' | 'none';

export type SelectMenuProps = {
  items: MenuItem[];
  title?: string;                    // Optional title/header

  // Selection (controlled & uncontrolled)
  selectionMode?: SelectionMode;     // default 'multiple'
  value?: string[] | string | null;  // ids (array for multiple, string for single)
  defaultValue?: string[] | string | null;
  onChange?: (value: string[] | string | null) => void;

  // Fired on click/Enter; always fires in 'none' mode and also fires in other modes after toggle/select
  onAction?: (id: string) => void;

  // Search is available by demand but OFF by default
  showSearch?: boolean;              // default false
  searchPlaceholder?: string;        // default 'Search'
  className?: string;
  style?: React.CSSProperties;
};

// Checkbox subcomponent using SVG assets
const Checkbox: React.FC<{
  checked: boolean;
  preview?: boolean;
  disabled?: boolean;
}> = ({ checked, preview, disabled }) => {
  const isSelected = preview || checked;
  
  return (
    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isSelected ? (
        // Blue filled checkbox for selected state
        <div 
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1
          }}
        >
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 16 16" 
            fill="none"
            style={{ color: 'white' }}
          >
            <path 
              d="M13.5 4.5L6 12L2.5 8.5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        // Empty checkbox SVG for unselected state
        <img 
          src="/svg/Checkbox.svg" 
          alt="checkbox" 
          width="16" 
          height="16"
          style={{ opacity: disabled ? 0.5 : 1 }}
        />
      )}
    </div>
  );
};

// Search icon SVG
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    className={className}
  >
    <path 
      d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M19 19L14.65 14.65" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const SelectMenu: React.FC<SelectMenuProps> = ({
  items,
  title,
  selectionMode = 'multiple',
  value,
  defaultValue,
  onChange,
  onAction,
  showSearch = false,
  searchPlaceholder = 'Search',
  className = '',
  style = {}
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string[] | string | null>(
    defaultValue || (selectionMode === 'multiple' ? [] : null)
  );
  
  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Focus management
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.label.toLowerCase().includes(query) ||
      (item.keywords && item.keywords.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  // Check if item is selected
  const isItemSelected = useCallback((itemId: string) => {
    if (selectionMode === 'multiple') {
      return Array.isArray(currentValue) && currentValue.includes(itemId);
    } else if (selectionMode === 'single') {
      return currentValue === itemId;
    }
    return false;
  }, [currentValue, selectionMode]);

  // Handle selection change
  const handleSelectionChange = useCallback((itemId: string) => {
    let newValue: string[] | string | null;
    
    if (selectionMode === 'multiple') {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      if (currentArray.includes(itemId)) {
        newValue = currentArray.filter(id => id !== itemId);
      } else {
        newValue = [...currentArray, itemId];
      }
    } else if (selectionMode === 'single') {
      newValue = currentValue === itemId ? null : itemId;
    } else {
      newValue = currentValue;
    }
    
    // Update internal state if uncontrolled
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    // Call onChange callback
    onChange?.(newValue);
    
    // Call onAction callback
    onAction?.(itemId);
  }, [currentValue, selectionMode, value, onChange, onAction]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (filteredItems[focusedIndex] && !filteredItems[focusedIndex].disabled) {
          handleSelectionChange(filteredItems[focusedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        menuRef.current?.blur();
        break;
    }
  }, [filteredItems, focusedIndex, handleSelectionChange]);

  // Update focused index when filtered items change
  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredItems]);

  // Focus management
  useEffect(() => {
    const focusedItem = itemRefs.current[focusedIndex];
    if (focusedItem) {
      focusedItem.focus();
    }
  }, [focusedIndex]);

  // Get appropriate ARIA attributes
  const getItemProps = (item: MenuItem, index: number) => {
    const baseProps = {
      id: `menu-item-${item.id}`,
      tabIndex: focusedIndex === index ? 0 : -1,
      disabled: item.disabled,
      onClick: () => !item.disabled && handleSelectionChange(item.id),
      onKeyDown: handleKeyDown,
      className: `
        w-full h-[60px] px-4 py-3 rounded-2xl flex items-center gap-4
        transition-all duration-150 text-left
        focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]/40 focus-visible:outline-none
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--hover-bg)]'}
      `,
      style: { backgroundColor: 'transparent' }
    };

    if (selectionMode === 'multiple') {
      return {
        ...baseProps,
        role: 'menuitemcheckbox',
        'aria-checked': isItemSelected(item.id)
      };
    } else if (selectionMode === 'single') {
      return {
        ...baseProps,
        role: 'menuitemradio',
        'aria-checked': isItemSelected(item.id),
        'aria-selected': isItemSelected(item.id)
      };
    } else {
      return {
        ...baseProps,
        role: 'menuitem'
      };
    }
  };

  return (
    <>
      <style>{CSS_VARS}</style>
      <div
        className={`
          bg-white border rounded-xl shadow-lg ring-1 ring-black/10
          p-1.5 font-sans
          ${className}
        `}
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#E6EAF2',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          ...style
        }}
        ref={menuRef}
        onKeyDown={handleKeyDown}
      >
        {/* Title */}
        {title && (
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ 
              fontWeight: '600', 
              fontSize: '14px', 
              lineHeight: '1.25', 
              color: '#0F172A' 
            }}>
              {title}
            </h3>
          </div>
        )}

        {/* Search Input */}
        {showSearch && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}>
                    <SearchIcon />
                  </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full h-9 pl-10 pr-3 rounded-lg bg-gray-50 border-none
                  text-sm font-medium placeholder-[var(--muted)]
                  focus:ring-2 focus:ring-[var(--ring)]/35 focus:outline-none
                "
                style={{ color: '#0F172A' }}
                aria-label="Search menu items"
                aria-controls="menu-list"
              />
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div
          id="menu-list"
          role="menu"
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#98A2B3' 
            }}>
              No matches
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = isItemSelected(item.id);
              const isFocused = focusedIndex === index;
              
              return (
                <button
                  key={item.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  {...getItemProps(item, index)}
                  style={{
                    width: '100%',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isFocused ? '#F2F4F7' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <Checkbox 
                    key={`checkbox-${item.id}-${isSelected}`}
                    checked={isSelected} 
                    preview={isFocused && !isSelected}
                    disabled={item.disabled}
                  />
                  <span 
                    style={{ 
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#0F172A'
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default SelectMenu;

