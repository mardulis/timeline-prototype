import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Popover } from '../design-system/adapters';
import FilterRulePill from '../components/FilterRulePill/FilterRulePill';
import MultiselectFilter from '../components/MultiselectFilter';
import { useSearch } from '../features/search/SearchCtx';
import { useDropdown } from '../contexts/DropdownContext';
import { ViewMode, Doc } from '../types/Timeline';
import DatePicker from '../components/DatePicker';

const FilterBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 12px; /* Consistent 12px top padding */
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px; /* Consistent 8px bottom margin */
`;

const SearchInputContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 8px 40px 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #1f2937;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px; /* Updated to 16x16 size */
  height: 16px; /* Updated to 16x16 size */
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--ds-secondary); /* Updated to use secondary color */
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  &:active {
    background: #e5e7eb;
  }
`;

const FiltersButton = styled.button<{ hasFilters: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: none;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
  
  img {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: #f9fafb;
  }
  
  &:active {
    background: #f3f4f6;
  }
`;

const FilterBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2582ff;
  color: #ffffff;
  border-radius: 10px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
`;

const FilterRow = styled.div<{ isVisible: boolean }>`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  max-height: ${props => props.isVisible ? '200px' : '0'};
  opacity: ${props => props.isVisible ? '1' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  padding: ${props => props.isVisible ? '8px 0' : '0'}; /* 8px top and bottom padding when visible */
  margin-bottom: ${props => props.isVisible ? '8px' : '0'}; /* 8px bottom margin when visible */
  position: relative;
  z-index: 1100;
`;

const MoreFiltersDropdown = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 8px;
  min-width: 200px;
`;

const MoreFiltersItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
  
  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const MoreFiltersContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MoreFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:active {
    background: #f3f4f6;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #2582FF;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(37, 130, 255, 0.1);
  }
  
  &:active {
    background: rgba(37, 130, 255, 0.2);
  }
`;

const FilterPillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuickFilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 6px 12px; /* Figma: 6px top/bottom, 12px left/right */
  border-radius: 10px;
  border: 1px dashed #d1d5db; /* Figma: var(--border/default/secondary) */
  background: #ffffff;
  color: #1f2937; /* Figma: var(--text/default/default) */
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4; /* Figma line-height */
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    /* Figma: icon color #1f2937 (var(--text/default/default)) */
    filter: brightness(0) saturate(100%) invert(11%) sepia(8%) saturate(1567%) hue-rotate(183deg) brightness(96%) contrast(93%);
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-left: auto;
  }
`;

const QuickFilterMenu = styled.div<{ isOpen: boolean; position: { top: number; left: number } }>`
  position: fixed;
  top: ${props => props.position.top}px;
  left: ${props => props.position.left}px;
  z-index: 50010;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 0.5px solid #e5e7eb;
  padding: 8px;
  min-width: 250px;
  max-width: min(90vw, 300px); /* Updated to max 300px */
  max-height: 60vh;
  overflow: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  /* No transitions - appear instantly in final position */
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
  
  /* Remove scrollbar borders */
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border: none;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
    border: none;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }
`;

const MenuSearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #374151;
  background: #ffffff;
  margin-bottom: 8px;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;


const QuickFilterMenuItem = styled.button<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #374151;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
`;


export function FilterBar() {
  const { filters, setFilters, results, allDocs, query, setQuery } = useSearch();
  const [newlyCreatedPills, setNewlyCreatedPills] = useState<Set<string>>(new Set());
  const { setOpenDropdown } = useDropdown();
  
  // Custom clear filters handler
  const handleClearAllFilters = () => {
    // Clear query
    setQuery('');
    
    // Reset fixed filters to empty (they stay as dashed buttons)
    // Remove More filters completely
    setFilters({
      title: { values: [], operator: 'is' },
      date: undefined,
      author: { values: [], operator: 'is' },
      // Don't include More filters (facility, docType) - they get removed completely
      creationOrder: [] // Reset creation order
    });
    
    // Clear newly created pills tracking
    setNewlyCreatedPills(new Set());
  };
  
  // State for quick filter menus
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = React.useState<string>('');
  const [showFilterSection, setShowFilterSection] = React.useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [datePickerMode, setDatePickerMode] = React.useState<'specific' | 'range' | null>(null);
  const [tempDateRange, setTempDateRange] = React.useState<{ start?: Date | null; end?: Date | null }>({ start: null, end: null });
  const dateFilterButtonRef = useRef<HTMLButtonElement | null>(null);
  const quickFilterRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const quickFilterScrollRef = React.useRef<HTMLDivElement | null>(null);
  const quickFilterScrollPosition = React.useRef<number>(0);
  const isTogglingQuickFilter = React.useRef<boolean>(false);
  
  // Ref callback that restores scroll immediately on remount during toggle
  const setQuickFilterScrollRef = React.useCallback((node: HTMLDivElement | null) => {
    quickFilterScrollRef.current = node;
    if (node && isTogglingQuickFilter.current) {
      node.scrollTop = quickFilterScrollPosition.current;
    }
  }, []);
  
  // Keep newly created pills visible until refresh - no need to clear them when they get values
  
  // Remove empty pills on component mount/refresh
  React.useEffect(() => {
    if (activeQuickFilter) {
      const buttonRef = quickFilterRefs.current[activeQuickFilter];
      if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
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
        
        setMenuPosition({ top, left });
        setMenuVisible(true); // Show menu only after positioning is complete
      } else {
        // Fallback positioning when ref is not available (e.g., from More filters)
        // Position relative to the More filters button or use a default position
        const moreFiltersButton = document.querySelector('[data-more-filters-button]');
        if (moreFiltersButton) {
          const rect = moreFiltersButton.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
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
          
          setMenuPosition({ top, left });
          setMenuVisible(true);
        } else {
          // Ultimate fallback - center the menu
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const top = Math.max(16, (viewportHeight - 250) / 2);
          const left = Math.max(16, (viewportWidth - 300) / 2);
          
          setMenuPosition({ top, left });
          setMenuVisible(true);
        }
      }
    } else {
      setMenuVisible(false); // Hide menu when closed
    }
  }, [activeQuickFilter]);
  
  // Note: We don't automatically clear newlyCreatedPills with a timeout anymore.
  // Instead, pills are removed from newlyCreatedPills when:
  // 1. A value is selected (pill becomes permanent) - handled in handleFilterDropdownClose
  // 2. Dropdown closes without a value (pill is removed) - handled in handleFilterDropdownClose
  
  // Helper function to check if a filter has values
  const filterHasValues = (filterKey: string): boolean => {
    switch (filterKey) {
      case 'author':
        return (filters.author?.values?.length ?? 0) > 0;
      case 'facility':
        return (filters.facility?.values?.length ?? 0) > 0;
      case 'docType':
        return (filters.docType?.values?.length ?? 0) > 0;
      case 'medications':
        return (filters.medications?.values?.length ?? 0) > 0;
      case 'diagnoses':
        return (filters.diagnoses?.values?.length ?? 0) > 0;
      case 'labs':
        return (filters.labs?.values?.length ?? 0) > 0;
      case 'medical':
        return (
          (filters.medical?.medications?.length ?? 0) > 0 ||
          (filters.medical?.diagnoses?.length ?? 0) > 0 ||
          (filters.medical?.labs?.length ?? 0) > 0
        );
      case 'date':
        return !!(filters.date?.start || filters.date?.end);
      default:
        return false;
    }
  };
  
  // Handler for when a filter dropdown closes - only for newly created filters
  const handleFilterDropdownClose = (filterKey: string) => {
    // This is called when a filter dropdown closes
    // Only act on filters that are being created (in newlyCreatedPills)
    
    if (newlyCreatedPills.has(filterKey)) {
      // Use functional update to check LATEST filter values (not stale closure values)
      setFilters(prevFilters => {
        // Check if filter has values using the LATEST state
        let hasValues = false;
        switch (filterKey) {
          case 'author':
            hasValues = (prevFilters.author?.values?.length ?? 0) > 0;
            break;
          case 'facility':
            hasValues = (prevFilters.facility?.values?.length ?? 0) > 0;
            break;
          case 'docType':
            hasValues = (prevFilters.docType?.values?.length ?? 0) > 0;
            break;
          case 'medications':
            hasValues = (prevFilters.medications?.values?.length ?? 0) > 0;
            break;
          case 'diagnoses':
            hasValues = (prevFilters.diagnoses?.values?.length ?? 0) > 0;
            break;
          case 'labs':
            hasValues = (prevFilters.labs?.values?.length ?? 0) > 0;
            break;
        }
        
        // If filter has no values, remove it entirely
        if (!hasValues) {
          const updatedFilters = removeFromCreationOrder(filterKey, { ...prevFilters });
          delete (updatedFilters as any)[filterKey];
          return updatedFilters;
        }
        
        // If filter has values, keep it as-is
        return prevFilters;
      });
      
      // Remove from newly created pills tracking when dropdown closes
      // After this, the filter is "permanent" and can only be removed by X or Clear filters
      setNewlyCreatedPills(prev => {
        const newSet = new Set(prev);
        newSet.delete(filterKey);
        return newSet;
      });
    }
    // Note: For established pills (not in newlyCreatedPills), this function does nothing
  };
  
  // Keep menu open even if quick filter button disappears (when pill is created)
  // Only close menu when user explicitly clicks outside or selects single-select item
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeQuickFilter) {
        // Check if click is outside the menu and outside any quick filter button
        const clickedElement = event.target as Node;
        const isInsideMenu = document.querySelector('[data-quick-filter-menu]')?.contains(clickedElement);
        const isInsideQuickFilterButton = quickFilterRefs.current[activeQuickFilter]?.contains(clickedElement);
        
        if (!isInsideMenu && !isInsideQuickFilterButton) {
          // Check if we should remove the filter (if it's newly created and has no value)
          handleFilterDropdownClose(activeQuickFilter);
          setActiveQuickFilter(null);
        }
      }
    };
    
    if (activeQuickFilter) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeQuickFilter]);
  
  // Function to close the more filters dropdown
  const closeMoreFilters = () => {
    setOpenDropdown(null);
  };
  
  // Function to filter menu items based on search query
  const getFilteredMenuItems = (filter: { values: Array<{ id: string; label: string }> }) => {
    if (!menuSearchQuery.trim()) {
      return filter.values;
    }
    
    return filter.values.filter((value: { id: string; label: string }) =>
      value.label.toLowerCase().includes(menuSearchQuery.toLowerCase())
    );
  };
  
  // Reset search query when opening a new menu
  React.useEffect(() => {
    if (activeQuickFilter) {
      setMenuSearchQuery('');
      quickFilterScrollPosition.current = 0; // Reset scroll when opening new menu
    }
  }, [activeQuickFilter]);
  
  // Restore scroll position after toggle (runs after commit, before paint)
  React.useLayoutEffect(() => {
    if (!isTogglingQuickFilter.current) return;
    const el = quickFilterScrollRef.current;
    if (el) {
      el.scrollTop = quickFilterScrollPosition.current;
    }
    isTogglingQuickFilter.current = false;
  }, [filters.diagnoses, filters.medications, filters.medical]);
  
  // Initialize URL state management
  // useURLState(); // Temporarily disabled to test
  
  
  // Get all possible document types (for dropdown options) - static list from actual data
  const allPossibleTypes = React.useMemo(() => {
    return [
      'Non-Medical Miscellaneous',
      'Legal Document',
      'Medical Miscellaneous',
      'Consents',
      'Medication',
      'Emergency',
      'Diagnostic',
      'Medical Form',
      'Progress Note'
    ].sort();
  }, []);
  
  // Get available authors from results (for filtering) - kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const availableAuthors = React.useMemo(() => {
    const authors = new Set<string>();
    results.forEach(doc => {
      if (doc.author) authors.add(doc.author);
    });
    return Array.from(authors).sort();
  }, [results]);
  
  // Get all possible titles (for dropdown options) - extract from actual data
  const allPossibleTitles = React.useMemo(() => {
    const titles = new Set<string>();
    allDocs.forEach(doc => {
      if (doc.title) {
        titles.add(doc.title);
      }
    });
    return Array.from(titles).sort();
  }, [allDocs]);

  // Get all possible authors (for dropdown options) - extract from actual data
  const allPossibleAuthors = React.useMemo(() => {
    const authors = new Set<string>();
    allDocs.forEach(doc => {
      if (doc.author) {
        authors.add(doc.author);
      }
    });
    return Array.from(authors).sort();
  }, [allDocs]);
  
  // Get available facilities from results (for filtering) - kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const availableFacilities = React.useMemo(() => {
    const facilities = new Set<string>();
    results.forEach(doc => {
      if (doc.facility) facilities.add(doc.facility);
    });
    return Array.from(facilities).sort();
  }, [results]);
  
  // Get all possible facilities (for dropdown options) - extract from actual data
  const allPossibleFacilities = React.useMemo(() => {
    const facilities = new Set<string>();
    allDocs.forEach(doc => {
      if (doc.facility) {
        facilities.add(doc.facility);
      }
    });
    return Array.from(facilities).sort();
  }, [allDocs]);
  
  // Get all possible medications (from ALL documents, not filtered results)
  const allPossibleMedications = React.useMemo(() => {
    const medications = new Set<string>();
    allDocs.forEach(doc => {
      if (doc.medications && doc.medications.length > 0) {
        doc.medications.forEach(med => medications.add(med));
      }
    });
    return Array.from(medications).sort();
  }, [allDocs]);
  
  // Get all possible diagnoses (from ALL documents, not filtered results)
  const allPossibleDiagnoses = React.useMemo(() => {
    const diagnoses = new Set<string>();
    allDocs.forEach(doc => {
      if (doc.diagnoses && doc.diagnoses.length > 0) {
        doc.diagnoses.forEach(diag => diagnoses.add(diag));
      }
    });
    return Array.from(diagnoses).sort();
  }, [allDocs]);
  
  // Get all possible labs (from ALL documents, not filtered results)
  const allPossibleLabs = React.useMemo(() => {
    const labs = new Set<string>();
    allDocs.forEach(doc => {
      if (doc.labs && doc.labs.length > 0) {
        doc.labs.forEach(lab => labs.add(lab));
      }
    });
    return Array.from(labs).sort();
  }, [allDocs]);
  
  // Memoize the mapped value objects to prevent re-creating them on every render
  // This is CRITICAL for scroll position preservation in dropdowns
  const medicationValues = React.useMemo(
    () => allPossibleMedications.map(med => ({ id: med, label: med })),
    [allPossibleMedications]
  );
  
  const diagnosisValues = React.useMemo(
    () => allPossibleDiagnoses.map(diag => ({ id: diag, label: diag })),
    [allPossibleDiagnoses]
  );
  
  const labValues = React.useMemo(
    () => allPossibleLabs.map(lab => ({ id: lab, label: lab })),
    [allPossibleLabs]
  );
  
  // Helper function to add a filter to creation order
  const addToCreationOrder = (filterKey: string, newFilters: any) => {
    const currentOrder = newFilters.creationOrder || [];
    if (!currentOrder.includes(filterKey)) {
      return {
        ...newFilters,
        creationOrder: [...currentOrder, filterKey]
      };
    }
    return newFilters;
  };

  // Helper function to remove a filter from creation order
  const removeFromCreationOrder = (filterKey: string, newFilters: any) => {
    const currentOrder = newFilters.creationOrder || [];
    return {
      ...newFilters,
      creationOrder: currentOrder.filter((key: string) => key !== filterKey)
    };
  };

  // Helper function to get active filters in creation order
  const getActiveFiltersInOrder = () => {
    const creationOrder = filters.creationOrder || [];
    const activeFilters: Array<{ key: string; type: string; data: any }> = [];

    creationOrder.forEach(filterKey => {
      switch (filterKey) {
        case 'title':
          // Always show title filter if it's in creation order, even if empty
          activeFilters.push({ key: 'title', type: 'title', data: filters.title || { values: [] } });
          break;
        case 'date':
          // Always show date filter if it's in creation order, even if empty
          activeFilters.push({ key: 'date', type: 'date', data: filters.date || {} });
          break;
        case 'author':
          // Always show author filter if it's in creation order, even if empty
          activeFilters.push({ key: 'author', type: 'author', data: filters.author || { values: [] } });
          break;
        case 'facility':
          // Always show facility filter if it's in creation order, even if empty
          activeFilters.push({ key: 'facility', type: 'facility', data: filters.facility || { values: [] } });
          break;
        case 'docType':
          // Always show docType filter if it's in creation order, even if empty
          activeFilters.push({ key: 'docType', type: 'docType', data: filters.docType || { values: [] } });
          break;
      }
    });

    return activeFilters;
  };
  
  const handleDateChange = (dateValue: { start?: string; end?: string; operator?: string }) => {
    const newFilters = { ...filters, date: dateValue };
    if (dateValue.start || dateValue.end) {
      // Adding or updating date filter
      const updatedFilters = addToCreationOrder('date', newFilters);
      setFilters({ ...updatedFilters, date: { ...dateValue, createdAt: Date.now() } });
    } else {
      // Removing date filter
      const updatedFilters = removeFromCreationOrder('date', newFilters);
      setFilters(updatedFilters);
    }
  };
  
  const handleMedicalChange = (medicalValue: { medications?: string[]; diagnoses?: string[]; labs?: string[] }) => {
    if (medicalValue.medications?.length || medicalValue.diagnoses?.length || medicalValue.labs?.length) {
      // Adding or updating medical filter - preserve ALL existing filters
      setFilters(prevFilters => {
        const newFilters = { 
          ...prevFilters,
          medical: medicalValue 
        };
        return addToCreationOrder('medical', newFilters);
      });
    } else {
      // Removing medical filter - preserve ALL existing filters
      setFilters(prevFilters => {
        const newFilters = { 
          ...prevFilters,
          medical: medicalValue 
        };
        return removeFromCreationOrder('medical', newFilters);
      });
    }
  };
  
  const handleDocTypeChange = (docTypeValue: string[]) => {
    const operator = docTypeValue.length === 1 ? 'is' : 'is-any-of';
    
    // Use functional update to avoid overwriting other concurrent filter changes
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        docType: { values: docTypeValue, operator } 
      };
      // Always keep the filter (even if empty), unless explicitly cleared
      return addToCreationOrder('docType', newFilters);
    });
    
    // Don't remove from newlyCreatedPills here - let handleFilterDropdownClose do it
    // This keeps the dropdown open for multiple selections, matching fixed filter behavior
  };
  
  const handleDocTypeClear = () => {
    // Explicitly remove the filter when X is clicked
    const newFilters = { ...filters };
    delete (newFilters as any).docType;
    const updatedFilters = removeFromCreationOrder('docType', newFilters);
    setFilters(updatedFilters);
  };
  
  const handleTitleChange = (titleValue: string[]) => {
    const operator = titleValue.length === 1 ? 'is' : 'is-any-of';
    
    // Use functional update to avoid overwriting other concurrent filter changes
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        title: { values: titleValue, operator } 
      };
      // Always keep the filter (even if empty), unless explicitly cleared
      return addToCreationOrder('title', newFilters);
    });
    
    // Don't remove from newlyCreatedPills here - let handleFilterDropdownClose do it
    // This keeps the dropdown open for multiple selections, matching fixed filter behavior
  };
  
  const handleTitleClear = () => {
    // Explicitly remove the filter when X is clicked
    const newFilters = { ...filters };
    delete (newFilters as any).title;
    const updatedFilters = removeFromCreationOrder('title', newFilters);
    setFilters(updatedFilters);
  };
  
  const handleTitleOperatorChange = (operator: string) => {
    if (filters.title) {
      setFilters({ ...filters, title: { ...filters.title, operator } });
    }
  };
  
  const handleAuthorChange = (authorValue: string[]) => {
    const operator = authorValue.length === 1 ? 'is' : 'is-any-of';
    
    // Use functional update to avoid overwriting other concurrent filter changes
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        author: { values: authorValue, operator } 
      };
      // Always keep the filter (even if empty), unless explicitly cleared
      return addToCreationOrder('author', newFilters);
    });
    
    // Don't remove from newlyCreatedPills here - let handleFilterDropdownClose do it
    // This keeps the dropdown open for multiple selections, matching fixed filter behavior
  };
  
  const handleAuthorClear = () => {
    // Explicitly remove the filter when X is clicked
    const newFilters = { ...filters };
    delete (newFilters as any).author;
    const updatedFilters = removeFromCreationOrder('author', newFilters);
    setFilters(updatedFilters);
  };
  
  const handleFacilityChange = (facilityValue: string[]) => {
    const operator = facilityValue.length === 1 ? 'is' : 'is-any-of';
    
    // Use functional update to avoid overwriting other concurrent filter changes
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        facility: { values: facilityValue, operator } 
      };
      // Always keep the filter (even if empty), unless explicitly cleared
      return addToCreationOrder('facility', newFilters);
    });
    
    // Don't remove from newlyCreatedPills here - let handleFilterDropdownClose do it
    // This keeps the dropdown open for multiple selections, matching fixed filter behavior
  };
  
  const handleFacilityClear = () => {
    // Explicitly remove the filter when X is clicked
    const newFilters = { ...filters };
    delete (newFilters as any).facility;
    const updatedFilters = removeFromCreationOrder('facility', newFilters);
    setFilters(updatedFilters);
  };

  // Operator change handlers
  const handleDocTypeOperatorChange = (operator: string) => {
    const newFilters = { 
      ...filters, 
      docType: { ...filters.docType, operator } 
    };
    setFilters(newFilters);
  };

  const handleAuthorOperatorChange = (operator: string) => {
    const newFilters = { 
      ...filters, 
      author: { ...filters.author, operator } 
    };
    setFilters(newFilters);
  };

  const handleFacilityOperatorChange = (operator: string) => {
    const newFilters = { 
      ...filters, 
      facility: { ...filters.facility, operator } 
    };
    setFilters(newFilters);
  };
  
  // Individual medication/diagnosis/lab filter handlers (separate from Medical Entity)
  const handleMedicationsChange = (medicationValues: string[]) => {
    const operator = medicationValues.length === 1 ? 'is' : 'is-any-of';
    
    // Always keep the filter (even if empty), unless explicitly cleared
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        medications: { values: medicationValues, operator } 
      };
      return addToCreationOrder('medications', newFilters);
    });
    
    // Fixed filters don't need to disengage QuickFilterMenu or manage newlyCreatedPills
    // They're always present and never go through the "newly created" flow
  };
  
  const handleMedicationsClear = () => {
    // Explicitly remove the filter when X is clicked
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete (newFilters as any).medications;
      return removeFromCreationOrder('medications', newFilters);
    });
  };
  
  const handleDiagnosesChange = (diagnosisValues: string[]) => {
    const operator = diagnosisValues.length === 1 ? 'is' : 'is-any-of';
    
    // Always keep the filter (even if empty), unless explicitly cleared
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        diagnoses: { values: diagnosisValues, operator } 
      };
      return addToCreationOrder('diagnoses', newFilters);
    });
    
    // Fixed filters don't need to disengage QuickFilterMenu or manage newlyCreatedPills
    // They're always present and never go through the "newly created" flow
  };
  
  const handleDiagnosesClear = () => {
    // Explicitly remove the filter when X is clicked
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete (newFilters as any).diagnoses;
      return removeFromCreationOrder('diagnoses', newFilters);
    });
  };
  
  const handleLabsChange = (labValues: string[]) => {
    const operator = labValues.length === 1 ? 'is' : 'is-any-of';
    
    // Use functional update to avoid overwriting other concurrent filter changes
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        labs: { values: labValues, operator } 
      };
      // Always keep the filter (even if empty), unless explicitly cleared
      return addToCreationOrder('labs', newFilters);
    });
    
    // Don't remove from newlyCreatedPills here - let handleFilterDropdownClose do it
    // This keeps the dropdown open for multiple selections, matching fixed filter behavior
  };
  
  const handleLabsClear = () => {
    // Explicitly remove the filter when X is clicked
    const newFilters = { ...filters };
    delete (newFilters as any).labs;
    const updatedFilters = removeFromCreationOrder('labs', newFilters);
    setFilters(updatedFilters);
  };
  
  // Operator change handlers for new filters
  const handleMedicationsOperatorChange = (operator: string) => {
    const newFilters = { 
      ...filters, 
      medications: { ...filters.medications, operator } 
    };
    setFilters(newFilters);
  };
  
  const handleDiagnosesOperatorChange = (operator: string) => {
    const newFilters = { 
      ...filters, 
      diagnoses: { ...filters.diagnoses, operator } 
    };
    setFilters(newFilters);
  };
  
  const handleLabsOperatorChange = (operator: string) => {
    const newFilters = { 
      ...filters, 
      labs: { ...filters.labs, operator } 
    };
    setFilters(newFilters);
  };
  
  
  const hasActiveFilters = !!(
    (filters.date?.start || filters.date?.end) || 
    filters.docType?.values?.length || 
    filters.medical?.medications?.length || 
    filters.medical?.diagnoses?.length || 
    filters.medical?.labs?.length ||
    filters.author?.values?.length ||
    filters.facility?.values?.length ||
    (filters.creationOrder && filters.creationOrder.length > 0) // Consider creation order as active filters
  );
  
  
  // Define pinned quick filters (always visible in fixed positions)
  // New pinned filters: Medical Entity, Diagnosis, Medication
  const quickFilters = React.useMemo(() => [
    { 
      key: 'title', 
      label: 'Title',
      icon: '/svg/Document.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'is-any-of', label: 'Is any of' }
      ],
      values: allPossibleTitles.map(title => ({ id: title, label: title })),
      value: null,
      onValueChange: (value: string | null) => {
        // Title filter - multiselect
        const currentTitles = filters.title?.values || [];
        const titleId = value as string;
        const newTitles = currentTitles.includes(titleId)
          ? currentTitles.filter(t => t !== titleId)
          : [...currentTitles, titleId];
        handleTitleChange(newTitles);
      },
      onClear: handleTitleClear
    },
    { 
      key: 'date', 
      label: 'Date',
      icon: '/svg/calendar0321.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'before', label: 'Before' },
        { id: 'after', label: 'After' },
        { id: 'between', label: 'Between' }
      ],
      values: [
        { id: 'specific', label: 'Specific Date' },
        { id: 'range', label: 'Date Range' },
        { id: 'before-dol', label: 'Before DOL' },
        { id: 'after-dol', label: 'After DOL' }
      ],
      value: null,
      onValueChange: (value: string | null) => {
        // Date filter - single select (choose date mode)
        if (value === 'specific') {
          // Close dropdown and show DatePicker component for single date selection
          setActiveQuickFilter(null);
          setDatePickerMode('specific');
          setTempDateRange({ start: null, end: null });
          setTimeout(() => setShowDatePicker(true), 100);
        } else if (value === 'range') {
          // Close dropdown and show DatePicker component for range selection
          setActiveQuickFilter(null);
          setDatePickerMode('range');
          setTempDateRange({ start: null, end: null });
          setTimeout(() => setShowDatePicker(true), 100);
        } else if (value === 'before-dol') {
          // Set to DOL date automatically
          const dolDate = new Date(2020, 2, 27); // Will get from getDOLDate()
          setFilters(prevFilters => addToCreationOrder('date', { 
            ...prevFilters, 
            date: { operator: 'before', end: dolDate.toISOString().split('T')[0], mode: 'before-dol' }
          }));
        } else if (value === 'after-dol') {
          // Set to DOL date automatically
          const dolDate = new Date(2020, 2, 27); // Will get from getDOLDate()
          setFilters(prevFilters => addToCreationOrder('date', { 
            ...prevFilters, 
            date: { operator: 'after', start: dolDate.toISOString().split('T')[0], mode: 'after-dol' }
          }));
        }
      },
      onClear: () => setFilters({ ...filters, date: undefined })
    },
    { 
      key: 'author', 
      label: 'Author',
      icon: '/svg/profile.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'is-any-of', label: 'Is any of' }
      ],
      values: allPossibleAuthors.map(author => ({ id: author, label: author })),
      value: null,
      onValueChange: (value: string | null) => {
        // Author filter - multiselect
        const currentAuthors = filters.author?.values || [];
        const authorId = value as string;
        const newAuthors = currentAuthors.includes(authorId)
          ? currentAuthors.filter(a => a !== authorId)
          : [...currentAuthors, authorId];
        handleAuthorChange(newAuthors);
      },
      onClear: handleAuthorClear
    }
  ], [allPossibleTitles, allPossibleAuthors, filters.title?.values, filters.date, filters.author?.values]);
  
  // Auto-focus search input when menu opens
  React.useEffect(() => {
    if (menuVisible && activeQuickFilter) {
      const filter = quickFilters.find(f => f.key === activeQuickFilter);
      if (filter) {
        const shouldShowSearch = (filter.key === 'diagnoses' && allPossibleDiagnoses.length > 5) ||
                               (filter.key === 'medications' && allPossibleMedications.length > 5) ||
                               (filter.key === 'docType' && allPossibleTypes.length > 5);
        
        if (shouldShowSearch) {
          // Small delay to ensure the menu is rendered
          setTimeout(() => {
            const searchInput = document.querySelector('[data-quick-filter-menu] input[type="text"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }, 10);
        }
      }
    }
  }, [menuVisible, activeQuickFilter, allPossibleDiagnoses.length, allPossibleMedications.length, allPossibleTypes.length, quickFilters]);
  
  // Handle filter section toggle
  const handleFilterSectionToggle = () => {
    setShowFilterSection(!showFilterSection);
  };
  
  // Filter metadata for all filters (used for rendering dashed buttons)
  const filterMetadata: Record<string, { label: string; icon: string }> = {
    'docType': { label: 'Doc type', icon: '/svg/Document.svg' },
    'author': { label: 'Author', icon: '/svg/profile.svg' },
    'facility': { label: 'Facility', icon: '/svg/View.svg' },
    'labs': { label: 'Labs', icon: '/svg/Labs.svg' },
    'date': { label: 'Date', icon: '/svg/calendar0321.svg' },
    'medical': { label: 'Medical Entity', icon: '/svg/cells.svg' },
    'diagnoses': { label: 'Diagnosis', icon: '/svg/Diagnosis.svg' },
    'medications': { label: 'Medication', icon: '/svg/Medications.svg' },
  };
  
  // Get filters for More Filters menu (excludes pinned filters: Medical Entity, Diagnosis, Medication)
  // Also excludes Date filter per user request
  const getMoreFilters = () => {
    const activeFilterKeys = new Set();
    
    // Check which filters are currently active
    if (filters.docType?.values?.length) activeFilterKeys.add('docType');
    if (filters.facility?.values?.length) activeFilterKeys.add('facility');
    
    // Define all available filters for More Filters menu
    // NOTE: Pinned filters (Title, Date, Author) are NOT included here
    // Only Facility and Doc Type are available in More Filters for MVP1
    const allAvailableFilters = [
      {
        key: 'facility',
        label: 'Facility',
        icon: '/svg/View.svg',
        type: 'multiselect' as const,
        values: allPossibleFacilities.map(facility => ({ id: facility, label: facility })),
        onValueChange: (valueId: string) => {
          const currentFacilities = filters.facility?.values || [];
          const newFacilities = currentFacilities.includes(valueId) 
            ? currentFacilities.filter((f: string) => f !== valueId)
            : [...currentFacilities, valueId];
          handleFacilityChange(newFacilities);
        },
        onClear: handleFacilityClear
      },
      {
        key: 'docType',
        label: 'Doc type',
        icon: '/svg/Document.svg',
        type: 'multiselect' as const,
        values: allPossibleTypes.map(type => ({ id: type, label: type })),
        onValueChange: (valueId: string) => {
          const currentTypes = filters.docType?.values || [];
          const newTypes = currentTypes.includes(valueId) 
            ? currentTypes.filter((t: string) => t !== valueId)
            : [...currentTypes, valueId];
          handleDocTypeChange(newTypes);
        },
        onClear: handleDocTypeClear
      }
    ];
    
    // Filter out active filters
    return allAvailableFilters.filter(filter => !activeFilterKeys.has(filter.key));
  };
  
  const moreFilters = React.useMemo(() => getMoreFilters(), [
    filters.docType?.values?.length,
    filters.facility?.values?.length,
    allPossibleTypes,
    allPossibleFacilities
  ]);
  
  return (
        <FilterBarContainer>
          {/* Search input row */}
          <SearchRow>
            <SearchInputContainer>
              <SearchInput
                type="text"
                placeholder="Search documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <SearchClearButton
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <img src="/svg/clear.svg" alt="Clear" width="16" height="16" />
                </SearchClearButton>
              )}
            </SearchInputContainer>
            
            <FiltersButton
              hasFilters={getActiveFiltersInOrder().length > 0}
              onClick={handleFilterSectionToggle}
            >
              <img src="/svg/filterMailCircleStrokeRounded.svg" alt="Filters" width="16" height="16" />
              Filters
              {getActiveFiltersInOrder().length > 0 && (
                <FilterBadge>{getActiveFiltersInOrder().length}</FilterBadge>
              )}
            </FiltersButton>
          </SearchRow>
          
          {/* Filter pills row */}
          <FilterRow isVisible={showFilterSection}>
            <FilterPillsContainer>
          {/* Render pinned filters in fixed positions (Medical Entity, Diagnosis, Medication) */}
          {/* Each position shows either a dashed button (no value) or a pill (has value) */}
          {quickFilters.map(filter => {
            // Check if this filter has a value
            let hasValue = false;
            let activeFilter = null;
            
            if (filter.key === 'title') {
              hasValue = (filters.title?.values || []).length > 0;
              if (hasValue) {
                activeFilter = getActiveFiltersInOrder().find(f => f.type === 'title');
              }
            } else if (filter.key === 'date') {
              hasValue = !!(filters.date?.start || filters.date?.end);
              if (hasValue) {
                activeFilter = getActiveFiltersInOrder().find(f => f.type === 'date');
              }
            } else if (filter.key === 'author') {
              hasValue = (filters.author?.values || []).length > 0;
              if (hasValue) {
                activeFilter = getActiveFiltersInOrder().find(f => f.type === 'author');
              }
            }
            
            // If filter has a value, render the pill in this position
            if (hasValue && activeFilter) {
              if (filter.key === 'title') {
                return (
                  <MultiselectFilter
                    key="title"
                    label="Title"
                    icon={<img src="/svg/Document.svg" alt="Title" width="16" height="16" />}
                    values={allPossibleTitles.map(title => ({ id: title, label: title }))}
                    selectedValues={activeFilter.data?.values || []}
                    onValueChange={handleTitleChange}
                    onClear={handleTitleClear}
                    openValueMenuInitially={false}
                    // Fixed filters should never call onDropdownClose - they're always present
                  />
                );
              } else if (filter.key === 'date') {
                const dateData = activeFilter.data || {};
                const operator = dateData.operator || 'is';
                const mode = dateData.mode || '';
                
                // Format the date value for display
                let dateValue = '';
                if (mode === 'specific' && dateData.start) {
                  dateValue = new Date(dateData.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } else if (mode === 'range' && dateData.start && dateData.end) {
                  const startStr = new Date(dateData.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const endStr = new Date(dateData.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  dateValue = `${startStr} - ${endStr}`;
                } else if (mode === 'before-dol') {
                  dateValue = 'DOL';
                } else if (mode === 'after-dol') {
                  dateValue = 'DOL';
                }
                
                // DOL filters: value is static (not clickable)
                // Date/Range filters: value is clickable to open DatePicker
                const isDOLFilter = mode === 'before-dol' || mode === 'after-dol';
                
                return (
                  <FilterRulePill
                    key="date"
                    label="Date"
                    icon={<img src="/svg/calendar0321.svg" alt="Date" width="16" height="16" />}
                    operators={[
                      { id: 'is', label: 'Is' },
                      { id: 'before', label: 'Before' },
                      { id: 'after', label: 'After' },
                      { id: 'between', label: 'Between' }
                    ]}
                    operator={operator}
                    values={dateValue ? [{ id: isDOLFilter ? 'dol-value' : 'date-value', label: dateValue }] : []}
                    value={dateValue ? [isDOLFilter ? 'dol-value' : 'date-value'] : []}
                    onValueChange={(newValue) => {
                      // Only allow changing value for specific date and date range
                      if (!isDOLFilter && (mode === 'specific' || mode === 'range')) {
                        // Open DatePicker to select new date
                        setDatePickerMode(mode as 'specific' | 'range');
                        if (mode === 'specific' && dateData.start) {
                          setTempDateRange({ start: new Date(dateData.start), end: null });
                        } else if (mode === 'range' && dateData.start && dateData.end) {
                          setTempDateRange({ start: new Date(dateData.start), end: null });
                        }
                        setShowDatePicker(true);
                      }
                    }}
                    onClear={() => {
                      const newFilters = { ...filters };
                      delete (newFilters as any).date;
                      const updatedFilters = removeFromCreationOrder('date', newFilters);
                      setFilters(updatedFilters);
                    }}
                    openValueMenuInitially={false}
                    // Disable value menu for DOL filters
                    disableValueMenu={isDOLFilter}
                    // Fixed filters should never call onDropdownClose - they're always present
                  />
                );
              } else if (filter.key === 'author') {
                return (
                  <MultiselectFilter
                    key="author"
                    label="Author"
                    icon={<img src="/svg/profile.svg" alt="Author" width="16" height="16" />}
                    values={allPossibleAuthors.map(author => ({ id: author, label: author }))}
                    selectedValues={activeFilter.data?.values || []}
                    onValueChange={handleAuthorChange}
                    onClear={handleAuthorClear}
                    openValueMenuInitially={false}
                    // Fixed filters should never call onDropdownClose - they're always present
                  />
                );
              }
            }
            
            // If filter has no value, render the dashed button in this position
            return (
              <QuickFilterButton
                key={filter.key}
                ref={(el) => {
                  quickFilterRefs.current[filter.key] = el;
                  if (filter.key === 'date') {
                    dateFilterButtonRef.current = el;
                  }
                }}
                onClick={() => {
                  // Toggle dropdown menu for this filter
                  if (activeQuickFilter === filter.key) {
                    setActiveQuickFilter(null);
                  } else {
                    setActiveQuickFilter(filter.key);
                  }
                }}
              >
                <img src={filter.icon} alt={filter.label} width="16" height="16" />
                {filter.label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </QuickFilterButton>
            );
          })}
          
          {/* Show other active filter pills (NOT pinned filters) AFTER the 3 pinned positions */}
          {getActiveFiltersInOrder().filter(f => {
            // Exclude pinned filters (Title, Date, Author)
            if (f.type === 'title' || f.type === 'date' || f.type === 'author') return false;
            // Only show as pill if it has values (same logic as fixed filters)
            if (!filterHasValues(f.key)) return false;
            return true;
          }).map(filter => {
            switch (filter.type) {
              case 'facility':
                return (
                  <MultiselectFilter
                    key="facility"
                    label="Facility"
                    icon={<img src="/svg/View.svg" alt="Facility" width="16" height="16" />}
                    values={allPossibleFacilities.map(facility => ({ id: facility, label: facility }))}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleFacilityChange}
                    onClear={handleFacilityClear}
                    onOperatorChange={handleFacilityOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('facility')}
                    onDropdownClose={() => handleFilterDropdownClose('facility')}
                  />
                );
              
              case 'docType':
                return (
                  <MultiselectFilter
                    key="docType"
                    label="Doc Type"
                    icon={<img src="/svg/Document.svg" alt="Doc Type" width="16" height="16" />}
                    values={allPossibleTypes.map(type => ({ id: type, label: type }))}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleDocTypeChange}
                    onClear={handleDocTypeClear}
                    onOperatorChange={handleDocTypeOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('docType')}
                    onDropdownClose={() => handleFilterDropdownClose('docType')}
                  />
                );
              
              default:
                return null;
            }
          })}
          
          {/* Show dashed buttons only for filters without values (same as fixed filters) */}
          {Array.from(new Set([
            // Newly created filters without values
            ...Array.from(newlyCreatedPills)
              .filter(key => !['title', 'date', 'author'].includes(key))
              .filter(key => !filterHasValues(key))
          ])).map(filterKey => {
            const metadata = filterMetadata[filterKey];
            if (!metadata) return null;
            
            return (
              <QuickFilterButton
                key={filterKey}
                ref={(el) => {
                  quickFilterRefs.current[filterKey] = el;
                }}
                onClick={() => {
                  // Toggle dropdown menu for this filter
                  if (activeQuickFilter === filterKey) {
                    setActiveQuickFilter(null);
                  } else {
                    setActiveQuickFilter(filterKey);
                  }
                }}
              >
                <img src={metadata.icon} alt={metadata.label} width="16" height="16" />
                {metadata.label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </QuickFilterButton>
            );
          })}
          
          {/* Original conditional logic - commented out for debugging */}
          {/* {!hasActiveFilters && quickFilters.map(filter => (
            <FilterRulePill
              key={filter.key}
              label={filter.label}
              icon={<img src={filter.icon} alt={filter.label} width="16" height="16" />}
              operators={filter.operators}
              values={filter.values}
              value={filter.value}
              onValueChange={filter.onValueChange}
              onClear={filter.onClear}
            />
          ))} */}
          
          {/* Right-aligned actions */}
          <ActionsContainer>
            {/* More Filters button - only show when there are unused filters */}
            {moreFilters.length > 0 && (
              <MoreFiltersContainer>
                <Popover
                  id="more-filters"
                  trigger={
                    <MoreFiltersButton data-more-filters-button>
                      + More filters
                    </MoreFiltersButton>
                  }
                >
                  <MoreFiltersDropdown>
                    {moreFilters.map(filter => {
                      // All filters are now regular clickable items
                      return (
                          <MoreFiltersItem key={filter.key} onClick={() => {
                            // Close the more filters dropdown FIRST
                            closeMoreFilters();
                            
                            // Initialize the filter with empty values in state
                            setFilters(prevFilters => {
                              const newFilters = {
                                ...prevFilters,
                                [filter.key]: { values: [], operator: 'is-any-of' }
                              };
                              return addToCreationOrder(filter.key, newFilters);
                            });
                            
                            // Mark as newly created and open the dropdown
                            setNewlyCreatedPills(prev => {
                              const newSet = new Set(prev);
                              newSet.add(filter.key);
                              return newSet;
                            });
                            
                            // Open the value dropdown (same as clicking the dashed button)
                            setActiveQuickFilter(filter.key);
                          }}>
                            <img src={filter.icon} alt={filter.label} width="16" height="16" />
                            {filter.label}
                          </MoreFiltersItem>
                        );
                    })}
                  </MoreFiltersDropdown>
                </Popover>
              </MoreFiltersContainer>
            )}
            
            {/* Clear all button - only show when there are active filters */}
            {hasActiveFilters && (
              <ClearButton onClick={handleClearAllFilters}>
                <img src="/svg/cancelCircle.svg" alt="Clear" width="16" height="16" />
                Clear
              </ClearButton>
            )}
            </ActionsContainer>
            </FilterPillsContainer>
          </FilterRow>
          
          {/* Quick Filter Menus */}
          {activeQuickFilter && (() => {
            // Check both pinned filters (quickFilters) and More filters (moreFilters)
            const pinnedFilter = quickFilters.find(f => f.key === activeQuickFilter);
            const moreFilterDef = !pinnedFilter ? moreFilters.find(f => f.key === activeQuickFilter) : undefined;
            const filter = (pinnedFilter || moreFilterDef) as any;
            if (!filter) return null;
            
            // Determine if this is a multiselect filter
            // Pinned filters: title, author
            // More filters: facility, docType
            const isMultiselect = filter.key === 'title' || 
                                 filter.key === 'author' ||
                                 filter.key === 'facility' ||
                                 filter.key === 'docType';
            
            const filteredValues = getFilteredMenuItems(filter);
            
            // Determine if search input should be shown (only for filters with many options)
            const shouldShowSearch = (filter.key === 'title' && allPossibleTitles.length > 5) ||
                                   (filter.key === 'docType' && allPossibleTypes.length > 5) ||
                                   (filter.key === 'author' && allPossibleAuthors.length > 5) ||
                                   (filter.key === 'facility' && allPossibleFacilities.length > 5);
            
            return (
              <QuickFilterMenu
                isOpen={menuVisible}
                position={menuPosition}
                data-quick-filter-menu
              >
                {/* Search input - sticky at top */}
                {shouldShowSearch && (
                  <div style={{
                    position: 'sticky',
                    top: 0,
                    background: '#ffffff',
                    zIndex: 1,
                    paddingBottom: '8px',
                    marginBottom: '4px'
                    /* No divider line below search */
                  }}>
                    <MenuSearchInput
                      type="text"
                      placeholder={`Search ${filter.label.toLowerCase()}...`}
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                    />
                  </div>
                )}
                
                {/* Filter items - scrollable */}
                <div 
                  ref={setQuickFilterScrollRef}
                  style={{
                    maxHeight: shouldShowSearch ? '50vh' : '60vh',
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                    scrollBehavior: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb transparent'
                  }}
                >
                  {filteredValues.map(value => {
                    // Determine if this value is currently selected
                    let isSelected = false;
                    if (filter.key === 'title') {
                      isSelected = (filters.title?.values || []).includes(value.id);
                    } else if (filter.key === 'date') {
                      const mode = (filters.date as any)?.mode;
                      isSelected = mode === value.id;
                    } else if (filter.key === 'author') {
                      isSelected = (filters.author?.values || []).includes(value.id);
                    } else if (filter.key === 'facility') {
                      isSelected = (filters.facility?.values || []).includes(value.id);
                    } else if (filter.key === 'docType') {
                      isSelected = (filters.docType?.values || []).includes(value.id);
                    }
                    
                    return (
                      <QuickFilterMenuItem
                        key={value.id}
                        type="button"
                        isSelected={isSelected}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          // Save scroll position before state change
                          const el = quickFilterScrollRef.current;
                          quickFilterScrollPosition.current = el ? el.scrollTop : 0;
                          isTogglingQuickFilter.current = true;
                          
                          // Apply the filter value (handles multiselect internally)
                          filter.onValueChange?.(value.id);
                          
                          // Only close menu for single-select filters
                          // Keep open for multiselect so user can select multiple values
                          if (!isMultiselect) {
                            setActiveQuickFilter(null);
                          }
                        }}
                      >
                        {isMultiselect && (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                            background: isSelected ? '#2582FF' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isSelected && (
                              <svg viewBox="0 0 20 20" width="16" height="16">
                                <path d="M16 6 8.5 13.5 4 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        )}
                        {value.label}
                      </QuickFilterMenuItem>
                    );
                  })}
                </div>
              </QuickFilterMenu>
            );
          })()}
          
          {/* DatePicker Component - shown outside dropdown */}
          {showDatePicker && dateFilterButtonRef.current && (() => {
            // Calculate the selected date to show in DatePicker
            let pickerSelectedDate = new Date();
            
            // If we have an existing date filter, use that date
            const existingDateFilter = filters.date;
            if (existingDateFilter) {
              if (existingDateFilter.start) {
                pickerSelectedDate = new Date(existingDateFilter.start);
              }
            }
            
            // For range selection in progress, use the temp start date
            if (datePickerMode === 'range' && tempDateRange.start) {
              pickerSelectedDate = tempDateRange.start;
            }
            
            // Get the date range from documents
            const docDates = allDocs.map(doc => new Date(doc.date).getTime());
            const minDocDate = new Date(Math.min(...docDates));
            const maxDocDate = new Date(Math.max(...docDates));
            
            // Helper text for range selection
            const rangeHelperText = datePickerMode === 'range' 
              ? (tempDateRange.start 
                  ? `Select end date (start: ${tempDateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`
                  : 'Select start date')
              : '';
            
            return (
              <>
                {datePickerMode === 'range' && (
                  <div style={{
                    position: 'fixed',
                    top: dateFilterButtonRef.current?.getBoundingClientRect().bottom || 0,
                    left: dateFilterButtonRef.current?.getBoundingClientRect().left || 0,
                    background: '#2582FF',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    fontSize: '12px',
                    fontWeight: 500,
                    zIndex: 50007,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {rangeHelperText}
                  </div>
                )}
                <DatePicker
                  selectedDate={pickerSelectedDate}
                  docs={allDocs}
                  onDateSelect={(date: Date) => {
                  if (datePickerMode === 'specific') {
                    // Single date selection - close immediately
                    setFilters(prevFilters => addToCreationOrder('date', {
                      ...prevFilters,
                      date: { operator: 'is', start: date.toISOString().split('T')[0], mode: 'specific' }
                    }));
                    setShowDatePicker(false);
                    setTempDateRange({ start: null, end: null });
                  } else if (datePickerMode === 'range') {
                    // Range selection - set start or end
                    if (!tempDateRange.start) {
                      // First click: set start date
                      setTempDateRange({ start: date, end: null });
                    } else {
                      // Second click: set end date and create filter
                      const start = tempDateRange.start;
                      const end = date;
                      // Ensure start is before end
                      const [startDate, endDate] = start > end ? [end, start] : [start, end];
                      setFilters(prevFilters => addToCreationOrder('date', {
                        ...prevFilters,
                        date: { 
                          operator: 'between', 
                          start: startDate.toISOString().split('T')[0], 
                          end: endDate.toISOString().split('T')[0], 
                          mode: 'range' 
                        }
                      }));
                      setShowDatePicker(false);
                      setTempDateRange({ start: null, end: null });
                    }
                  }
                }}
                onClose={() => {
                  setShowDatePicker(false);
                  setTempDateRange({ start: null, end: null });
                }}
                isVisible={showDatePicker}
                triggerRef={dateFilterButtonRef}
                highlightedDate={tempDateRange.start || null}
              />
              </>
            );
          })()}
        </FilterBarContainer>
      );
    }
