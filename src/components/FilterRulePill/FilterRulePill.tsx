import * as React from "react";
import { createPortal } from "react-dom";
import cls from "./FilterRulePill.module.css";
import { useDropdown } from "../../contexts/DropdownContext";
import useControllableState from "../../hooks/useControllableState";

export type OperatorOption = { id: string; label: string };
export type ValueOption = { id: string; label: string };

type MultiValue = string[];       // for multiple=true
type SingleValue = string | null; // for multiple=false

export interface FilterRulePillProps {
  icon?: React.ReactNode;
  label: string;
  operators: OperatorOption[];
  operator?: string;
  defaultOperator?: string;
  onOperatorChange?: (id: string) => void;
  values: ValueOption[];
  multiple?: boolean;
  value?: MultiValue | SingleValue;
  defaultValue?: MultiValue | SingleValue;
  onValueChange?: (v: MultiValue | SingleValue) => void;
  onClear?: () => void;
  onDropdownClose?: () => void; // Callback when dropdown closes
  className?: string;
  style?: React.CSSProperties;
  openValueMenuInitially?: boolean; // New prop to control initial value menu state
}

export default function FilterRulePill(props: FilterRulePillProps) {
  const {
    icon,
    label,
    operators,
    operator,
    defaultOperator,
    values,
    multiple = true,
    value,
    defaultValue,
    onValueChange,
    onClear,
    onDropdownClose,
    className,
    style,
    openValueMenuInitially = false
  } = props;

  const { openDropdown, setOpenDropdown } = useDropdown();
  
  // Generate unique IDs for this pill's dropdowns
  const pillId = React.useMemo(() => `pill-${label.toLowerCase().replace(/\s+/g, '-')}`, [label]);
  const valDropdownId = `${pillId}-value`;

  // Normalize defaults so state shape is always right
  const fallbackDefault: MultiValue | SingleValue = multiple ? [] : null;

  const [currentValue, setCurrentValue] = useControllableState<
    MultiValue | SingleValue
  >({
    value,
    defaultValue: defaultValue ?? fallbackDefault,
    onChange: onValueChange,
  });

  // Operator state (simplified for now)
  const [opId] = React.useState(operator || defaultOperator || operators[0]?.id || '');
  
  // Dropdown anchors
  const valBtnRef = React.useRef<HTMLButtonElement>(null);
  const [valPosition, setValPosition] = React.useState({ top: 0, left: 0 });
  const [valVisible, setValVisible] = React.useState(false);
  const [valSearchQuery, setValSearchQuery] = React.useState<string>('');
  
  // Stable portal host for dropdown (prevents remounting)
  const portalHostRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const host = document.createElement('div');
    host.setAttribute('data-filter-portal', valDropdownId);
    document.body.appendChild(host);
    portalHostRef.current = host;
    return () => {
      if (portalHostRef.current) {
        document.body.removeChild(portalHostRef.current);
        portalHostRef.current = null;
      }
    };
  }, [valDropdownId]);
  
  // Ref to preserve scroll position across re-renders
  const valuesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = React.useRef<number>(0);
  const isTogglingRef = React.useRef<boolean>(false);
  
  // Ref callback that restores scroll immediately on remount during toggle
  const setValuesContainerRef = React.useCallback((node: HTMLDivElement | null) => {
    valuesContainerRef.current = node;
    if (node && isTogglingRef.current) {
      node.scrollTop = scrollPositionRef.current;
    }
  }, []);

  // Check if dropdowns are open
  const valOpen = openDropdown === valDropdownId;

  // Filter values based on search query
  const filteredValues = React.useMemo(() => {
    if (!valSearchQuery.trim()) return values;
    
    const query = valSearchQuery.toLowerCase();
    return values.filter(opt => 
      opt.label.toLowerCase().includes(query)
    );
  }, [values, valSearchQuery]);

  // Clear search and reset scroll when dropdown closes or opens
  React.useEffect(() => {
    if (!valOpen) {
      setValSearchQuery('');
      scrollPositionRef.current = 0;
      isTogglingRef.current = false;
    }
  }, [valOpen]);
  
  // Reset scroll to top when opening (runs synchronously before paint)
  React.useLayoutEffect(() => {
    if (valOpen) {
      isTogglingRef.current = false;
      scrollPositionRef.current = 0;
      
      const el = valuesContainerRef.current;
      if (el) {
        // Immediate reset
        el.scrollTop = 0;
        
        // Also reset after next frame
        requestAnimationFrame(() => {
          if (el) el.scrollTop = 0;
        });
        
        // And after a small delay to catch any async updates
        setTimeout(() => {
          if (el) el.scrollTop = 0;
        }, 10);
      }
    }
  }, [valOpen]);
  
  // Restore scroll position after toggle (runs after commit, before paint)
  React.useLayoutEffect(() => {
    if (!isTogglingRef.current) return;
    const el = valuesContainerRef.current;
    if (el) {
      el.scrollTop = scrollPositionRef.current;
    }
    isTogglingRef.current = false;
  }, [currentValue]);

  // Auto-open value menu if requested
  React.useEffect(() => {
    if (openValueMenuInitially && !valOpen) {
      setOpenDropdown(valDropdownId);
    }
  }, [openValueMenuInitially, valOpen, valDropdownId, setOpenDropdown]);

  // Auto-focus search input when value menu opens
  React.useEffect(() => {
    if (valOpen && valVisible) {
      // Small delay to ensure the menu is rendered
      setTimeout(() => {
        const searchInput = document.querySelector(`[data-dropdown="${valDropdownId}"] input[type="text"]`) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 10);
    }
  }, [valOpen, valVisible, valDropdownId]);

  // --- Helpers --------------------------------------------------------------

  // ✅ Normalize once and use a Set for O(1) lookups
  const selectedSet = React.useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(currentValue) ? currentValue as string[] : [];
      return new Set(arr);
    } else {
      const one = (currentValue as string | null) ?? null;
      return new Set(one ? [one] : []);
    }
  }, [currentValue, multiple]);

  const isChecked = React.useCallback(
    (id: string) => selectedSet.has(id),
    [selectedSet]
  );

  const toggle = React.useCallback((id: string) => {
    // Save scroll position before state change
    const el = valuesContainerRef.current;
    scrollPositionRef.current = el ? el.scrollTop : 0;
    isTogglingRef.current = true;
    
    if (multiple) {
      const arr = Array.isArray(currentValue) ? [...(currentValue as string[])] : [];
      const i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(id);
      setCurrentValue(arr);
    } else {
      const one = (currentValue as string | null) ?? null;
      setCurrentValue(one === id ? null : id);
    }
  }, [currentValue, multiple, setCurrentValue]);

  // Label for the pill
  const valueLabel = React.useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(currentValue) ? (currentValue as MultiValue) : [];
      if (arr.length === 0) return "";
      if (arr.length === 1) {
        const selectedValue = values.find(v => v.id === arr[0]);
        return selectedValue?.label || arr[0];
      }
      return `${arr.length} selected`;
    } else {
      const id = currentValue as SingleValue;
      return id ? values.find(v => v.id === id)?.label ?? "" : "";
    }
  }, [currentValue, multiple, values]);

  const opLabel = operators.find(o => o.id === opId)?.label ?? "";

  React.useEffect(() => {
    if (valOpen && valBtnRef.current) {
      const rect = valBtnRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate optimal position
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX;
      
      // Prevent going off-screen horizontally
      const panelWidth = 300;
      if (left + panelWidth > viewportWidth - 16) {
        left = Math.max(16, viewportWidth - panelWidth - 16);
      }
      
      // Prevent going off-screen vertically
      const panelHeight = 250;
      if (top + panelHeight > viewportHeight + window.scrollY - 16) {
        top = Math.max(16, rect.top + window.scrollY - panelHeight - 4);
      }
      
      setValPosition({ top, left });
      setValVisible(true); // Show panel only after positioning is complete
    } else {
      setValVisible(false); // Hide panel when closed
    }
  }, [valOpen]);

  // Ensure panel min width >= trigger width
  React.useLayoutEffect(() => {
    const setWidth = (el?: HTMLElement | null) => {
      if (el) {
        const trigger = valBtnRef.current;
        if (trigger) {
          const triggerWidth = trigger.getBoundingClientRect().width;
          el.style.setProperty('--anchor-w', `${triggerWidth}px`);
        }
      }
    };
    
    if (valOpen) {
      const panel = document.querySelector(`[data-dropdown="${valDropdownId}"]`);
      setWidth(panel as HTMLElement);
    }
  }, [valOpen, valDropdownId]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`[data-dropdown="${valDropdownId}"]`)) {
        setOpenDropdown(null);
        // Notify parent that dropdown closed
        if (onDropdownClose) {
          onDropdownClose();
        }
      }
    };

    if (valOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [valOpen, valDropdownId, setOpenDropdown, onDropdownClose]);

  return (
    <div className={`${cls.pill} ${className || ''}`} style={style}>
      {/* Label segment */}
      <div className={cls.seg}>
        {icon && <span className={`${cls.icon} ${!valueLabel ? cls.iconEmpty : ''}`}>{icon}</span>}
        <span className={cls.labelText}>{label}</span>
      </div>

      {/* Operator segment */}
      <div
        className={`${cls.seg} ${cls.operatorText}`}
        style={{ cursor: 'default' }}
      >
        <span className={cls.operatorText}>{opLabel}</span>
      </div>

      {/* Value segment */}
      <button
        ref={valBtnRef}
        className={`${cls.segmentBtn} ${valOpen ? cls.open : ''}`}
        data-open={valOpen}
        onClick={() => {
          if (!valOpen) {
            // Reset scroll position when opening
            isTogglingRef.current = false;
            scrollPositionRef.current = 0;
          }
          setOpenDropdown(valOpen ? null : valDropdownId);
        }}
        aria-expanded={valOpen}
        aria-haspopup="menu"
      >
        <span className={`${cls.valueText} ${!valueLabel ? cls.isEmpty : ''}`}>
          {valueLabel || "Select value"}
        </span>
      </button>

      {/* Clear button */}
      {onClear && (
        <button
          className={cls.clearBtn}
          onClick={onClear}
          aria-label={`Clear ${label} filter`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Value menu */}
      {createPortal(
        <div 
          className={cls.panel} 
          role="menu" 
          style={{ 
            top: valPosition.top, 
            left: valPosition.left,
            display: valVisible ? 'block' : 'none'
          }}
          data-dropdown={valDropdownId}
        >
          {/* Search input - sticky at top (hidden for Medical Entity) */}
          {label !== 'Medical Entity' && (
            <div className={cls.searchContainer}>
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={valSearchQuery}
                onChange={(e) => setValSearchQuery(e.target.value)}
                className={cls.searchInput}
                autoFocus
              />
            </div>
          )}
          
          {/* Filtered values */}
          <div className={cls.valuesContainer} ref={setValuesContainerRef}>
            {filteredValues.length === 0 ? (
              <div className={cls.noResults}>No matches</div>
            ) : (
              filteredValues.map(opt => {
                // ✅ Derive per-row checked from the Set
                const checked = isChecked(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={checked}
                    className={cls.valueRow}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(opt.id);
                    }}
                  >
                    <span 
                      className={`${cls.checkbox} ${checked ? cls.checked : ""}`}
                    >
                      {checked && (
                        <svg viewBox="0 0 20 20" width="16" height="16">
                          <path d="M16 6 8.5 13.5 4 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className={cls.valueLabel}>{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        portalHostRef.current || document.body
      )}
    </div>
  );
}

