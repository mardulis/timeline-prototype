import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FilterMenuProps, MenuItem } from './types';
import styled from 'styled-components';

const MenuContainer = styled.div<{ width: string; top: number; left: number }>`
  position: absolute;
  z-index: 50;
  margin-top: 8px;
  border-radius: 18px;
  background: white;
  border: 0.5px solid #e5e7eb;
  box-shadow: 0px 1px 4px 0px rgba(3,7,18,0.1), 0px 1px 4px 0px rgba(12,12,13,0.05);
  padding: 8px;
  width: ${props => props.width};
  top: ${props => props.top}px;
  left: ${props => props.left}px;
`;

const PlaceholderText = styled.div`
  padding: 8px 8px 4px 8px;
  color: #6b7280;
  font-size: 13px;
`;

const MenuItemButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 150ms;
  font-size: 13px;
  color: #1f2937;
  opacity: ${props => props.disabled ? '0.5' : '1'};
  
  &:hover {
    background: ${props => props.disabled ? 'transparent' : '#f3f4f6'};
  }
`;

const Checkbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    display: block;
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
  }
`;

const IconContainer = styled.div`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const ItemLabel = styled.span`
  color: #1f2937;
  font-size: 13px;
`;

export const FilterMenu: React.FC<FilterMenuProps> = ({
  items,
  mode,
  selectedIds,
  onSelectionChange,
  open,
  onOpenChange,
  width = "250px",
  placeholder,
  closeOnSelect = true,
  anchorRef
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorRef.current && menuRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      let top = anchorRect.bottom + window.scrollY + 4; // 4px margin below anchor
      let left = anchorRect.left + window.scrollX;

      // Adjust if menu goes off right edge
      if (left + menuRect.width > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - menuRect.width - 10; // 10px padding from right
      }
      // Adjust if menu goes off left edge
      if (left < window.scrollX) {
        left = window.scrollX + 10; // 10px padding from left
      }

      setPosition({ top, left });
    }
  }, [open, anchorRef, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange, anchorRef]);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    let newSelection: string[];
    if (mode === 'single') {
      newSelection = [item.id];
      if (closeOnSelect) {
        onOpenChange(false);
      }
    } else { // multi-select
      if (selectedIds.includes(item.id)) {
        newSelection = selectedIds.filter(id => id !== item.id);
      } else {
        newSelection = [...selectedIds, item.id];
      }
    }
    onSelectionChange(newSelection);
  };

  const isItemSelected = (itemId: string) => selectedIds.includes(itemId);

  if (!open) return null;

  return createPortal(
    <MenuContainer
      ref={menuRef}
      width={width}
      top={position.top}
      left={position.left}
    >
      {placeholder && (
        <PlaceholderText>
          {placeholder}
        </PlaceholderText>
      )}

      {items.map((item) => (
        <MenuItemButton
          key={item.id}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
        >
          {mode === 'multi' && (
            <Checkbox checked={isItemSelected(item.id)}>
              <img 
                src={isItemSelected(item.id) ? "/svg/Checked.svg" : "/svg/Unchecked.svg"} 
                alt={isItemSelected(item.id) ? "checked" : "unchecked"} 
                width="20" 
                height="20"
                style={{ display: 'block', margin: 0, padding: 0 }}
              />
            </Checkbox>
          )}
          {item.icon && (
            <IconContainer>
              {item.icon}
            </IconContainer>
          )}
          <ItemLabel>
            {item.label}
          </ItemLabel>
        </MenuItemButton>
      ))}
    </MenuContainer>,
    document.body
  );
};