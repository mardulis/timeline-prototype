import React, { useRef, useEffect } from 'react';
import { useDropdown } from '../../contexts/DropdownContext';

export function Popover({ 
  trigger, 
  children, 
  id 
}: { 
  trigger: React.ReactNode; 
  children: React.ReactNode;
  id: string;
}) {
  const { openDropdown, setOpenDropdown } = useDropdown();
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const isOpen = openDropdown === id;
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpenDropdown]);
  
  // Calculate position for fixed positioning
  const getDropdownPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left
    };
  };
  
  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : id);
  };
  
  // Clone trigger element to add pressed state
  const triggerWithPressedState = React.isValidElement(trigger) 
    ? React.cloneElement(trigger, { pressed: isOpen } as any)
    : trigger;
  
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div ref={triggerRef} onClick={handleToggle}>{triggerWithPressedState}</div>
      {isOpen && (
        <div style={{
          position: 'fixed', /* Use fixed positioning to escape parent stacking context */
          top: getDropdownPosition().top,
          left: getDropdownPosition().left,
          zIndex: 1150, /* Higher than SearchControlsContainer (1000) and filter row (1100) */
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
