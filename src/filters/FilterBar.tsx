import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Popover } from '../design-system/adapters';
import FilterRulePill from '../components/FilterRulePill/FilterRulePill';
import MultiselectFilter from '../components/MultiselectFilter';
import { useSearch } from '../features/search/SearchCtx';
import { useDropdown } from '../contexts/DropdownContext';
import { ViewMode } from '../types/Timeline';

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
  const { filters, setFilters, results, allDocs, clearFilters, query, setQuery } = useSearch();
  const [newlyCreatedPills, setNewlyCreatedPills] = useState<Set<string>>(new Set());
  const { setOpenDropdown } = useDropdown();
  
  // State for quick filter menus
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = React.useState<string>('');
  const [showFilterSection, setShowFilterSection] = React.useState<boolean>(false);
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
  
  // Handler for when a filter dropdown closes - remove empty filters
  const handleFilterDropdownClose = (filterKey: string) => {
    // Only check newly created pills (temporary filters)
    if (newlyCreatedPills.has(filterKey)) {
      // If filter has no values, remove it
      if (!filterHasValues(filterKey)) {
        const updatedFilters = removeFromCreationOrder(filterKey, { ...filters });
        delete (updatedFilters as any)[filterKey];
        setFilters(updatedFilters);
        
        // Remove from newly created pills tracking
        setNewlyCreatedPills(prev => {
          const newSet = new Set(prev);
          newSet.delete(filterKey);
          return newSet;
        });
      } else {
        // Filter has values, it's now permanent - remove from tracking
        setNewlyCreatedPills(prev => {
          const newSet = new Set(prev);
          newSet.delete(filterKey);
          return newSet;
        });
      }
    }
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
  
  // Get all possible authors (for dropdown options) - static list from actual data
  const allPossibleAuthors = React.useMemo(() => {
    return [
      'Sir William Osler',
      'Edward Jenner',
      'Florence Nightingale',
      'Joseph Lister',
      'Alexander Fleming',
      'Norman Bethune',
      'Frederick Banting',
      'Charles Best',
      'Elizabeth Blackwell',
      'Harold Gillies',
      'James Barry',
      'Howard Florey',
      'Thomas Wakley',
      'John Snow',
      'Henry Gray',
      'Emily Stowe'
    ].sort();
  }, []);
  
  // Get available facilities from results (for filtering) - kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const availableFacilities = React.useMemo(() => {
    const facilities = new Set<string>();
    results.forEach(doc => {
      if (doc.facility) facilities.add(doc.facility);
    });
    return Array.from(facilities).sort();
  }, [results]);
  
  // Get all possible facilities (for dropdown options) - static list from actual data
  const allPossibleFacilities = React.useMemo(() => {
    return [
      '221B Consulting Clinic',
      'Barchester Infirmary',
      'Thornfield Hall Clinic',
      'Pemberley Manor Surgery',
      'Wuthering Heights Dispensary',
      'St. Mungo\'s Ward',
      'Baker Street Practice',
      'Bleak House Sanatorium',
      'Moor House Medical Rooms',
      'Howard\'s End Health Centre',
      'Middlemarch Hospital',
      'Dorian Gray Wellness Centre',
      'Crickhollow Clinic',
      'Gormenghast Infirmary',
      'Netherfield Park Surgery',
      'Hogsmeade Urgent Care'
    ].sort();
  }, []);
  
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
        case 'date':
          // Always show date filter if it's in creation order, even if empty
          activeFilters.push({ key: 'date', type: 'date', data: filters.date || {} });
          break;
        case 'facility':
          // Always show facility filter if it's in creation order, even if empty
          activeFilters.push({ key: 'facility', type: 'facility', data: filters.facility || { values: [] } });
          break;
        case 'medical':
          // Always show medical filter if it's in creation order, even if empty
          activeFilters.push({ key: 'medical', type: 'medical', data: filters.medical || { medications: [], diagnoses: [], labs: [] } });
          break;
        case 'author':
          // Always show author filter if it's in creation order, even if empty
          activeFilters.push({ key: 'author', type: 'author', data: filters.author || { values: [] } });
          break;
        case 'docType':
          // Always show docType filter if it's in creation order, even if empty
          activeFilters.push({ key: 'docType', type: 'docType', data: filters.docType || { values: [] } });
          break;
        case 'medications':
          // Always show medications filter if it's in creation order, even if empty
          activeFilters.push({ key: 'medications', type: 'medications', data: filters.medications || { values: [] } });
          break;
        case 'diagnoses':
          // Always show diagnoses filter if it's in creation order, even if empty
          activeFilters.push({ key: 'diagnoses', type: 'diagnoses', data: filters.diagnoses || { values: [] } });
          break;
        case 'labs':
          // Always show labs filter if it's in creation order, even if empty
          activeFilters.push({ key: 'labs', type: 'labs', data: filters.labs || { values: [] } });
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
    const newFilters = { 
      ...filters, 
      docType: { values: docTypeValue, operator } 
    };
    if (docTypeValue.length > 0) {
      // Adding or updating docType filter
      const updatedFilters = addToCreationOrder('docType', newFilters);
      setFilters(updatedFilters);
    } else {
      // Removing docType filter
      const updatedFilters = removeFromCreationOrder('docType', newFilters);
      setFilters(updatedFilters);
    }
  };
  
  const handleAuthorChange = (authorValue: string[]) => {
    const operator = authorValue.length === 1 ? 'is' : 'is-any-of';
    const newFilters = { 
      ...filters, 
      author: { values: authorValue, operator } 
    };
    if (authorValue.length > 0) {
      // Adding or updating author filter
      const updatedFilters = addToCreationOrder('author', newFilters);
      setFilters(updatedFilters);
    } else {
      // Removing author filter
      const updatedFilters = removeFromCreationOrder('author', newFilters);
      setFilters(updatedFilters);
    }
  };
  
  const handleFacilityChange = (facilityValue: string[]) => {
    const operator = facilityValue.length === 1 ? 'is' : 'is-any-of';
    const newFilters = { 
      ...filters, 
      facility: { values: facilityValue, operator } 
    };
    if (facilityValue.length > 0) {
      // Adding or updating facility filter
      const updatedFilters = addToCreationOrder('facility', newFilters);
      setFilters(updatedFilters);
    } else {
      // Removing facility filter
      const updatedFilters = removeFromCreationOrder('facility', newFilters);
      setFilters(updatedFilters);
    }
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
    
    if (medicationValues.length > 0) {
      setFilters(prevFilters => {
        const newFilters = { 
          ...prevFilters, 
          medications: { values: medicationValues, operator } 
        };
        return addToCreationOrder('medications', newFilters);
      });
    } else {
      setFilters(prevFilters => {
        const newFilters = { 
          ...prevFilters, 
          medications: { values: medicationValues, operator } 
        };
        return removeFromCreationOrder('medications', newFilters);
      });
    }
  };
  
  const handleDiagnosesChange = (diagnosisValues: string[]) => {
    const operator = diagnosisValues.length === 1 ? 'is' : 'is-any-of';
    
    if (diagnosisValues.length > 0) {
      setFilters(prevFilters => {
        const newFilters = { 
          ...prevFilters, 
          diagnoses: { values: diagnosisValues, operator } 
        };
        return addToCreationOrder('diagnoses', newFilters);
      });
    } else {
      setFilters(prevFilters => {
        const newFilters = { 
          ...prevFilters, 
          diagnoses: { values: diagnosisValues, operator } 
        };
        return removeFromCreationOrder('diagnoses', newFilters);
      });
    }
  };
  
  const handleLabsChange = (labValues: string[]) => {
    const operator = labValues.length === 1 ? 'is' : 'is-any-of';
    const newFilters = { 
      ...filters, 
      labs: { values: labValues, operator } 
    };
    if (labValues.length > 0) {
      const updatedFilters = addToCreationOrder('labs', newFilters);
      setFilters(updatedFilters);
    } else {
      const updatedFilters = removeFromCreationOrder('labs', newFilters);
      setFilters(updatedFilters);
    }
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
      key: 'medical', 
      label: 'Medical Entity',
      icon: '/svg/cells.svg',
      operators: [
        { id: 'has', label: 'Has' },
        { id: 'has-any-of', label: 'Has any of' }
      ],
      values: [
        { id: 'medications', label: 'Medications' },
        { id: 'diagnoses', label: 'Diagnoses' },
        { id: 'labs', label: 'Labs' }
      ],
      value: null,
      onValueChange: (value: string | null) => {
        // Medical filter - multiselect categories
        const medical = filters.medical || { medications: [], diagnoses: [], labs: [] };
        const category = value as string;
        
        // Toggle the category
        if (category === 'medications') {
          const newMedications = medical.medications?.length ? [] : ['Aspirin', 'Metformin'];
          handleMedicalChange({ ...medical, medications: newMedications });
        } else if (category === 'diagnoses') {
          const newDiagnoses = medical.diagnoses?.length ? [] : ['Diabetes', 'Hypertension'];
          handleMedicalChange({ ...medical, diagnoses: newDiagnoses });
        } else if (category === 'labs') {
          const newLabs = medical.labs?.length ? [] : ['Blood Test', 'Urine Test'];
          handleMedicalChange({ ...medical, labs: newLabs });
        }
      },
      onClear: () => handleMedicalChange({})
    },
    { 
      key: 'diagnoses', 
      label: 'Diagnosis',
      icon: '/svg/Diagnosis.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'is-any-of', label: 'Is any of' }
      ],
      values: allPossibleDiagnoses.map(diag => ({ id: diag, label: diag })),
      value: null,
      onValueChange: (value: string | null) => {
        // Diagnosis filter - multiselect
        const currentDiagnoses = filters.diagnoses?.values || [];
        const diagnosisId = value as string;
        const newDiagnoses = currentDiagnoses.includes(diagnosisId)
          ? currentDiagnoses.filter(d => d !== diagnosisId)
          : [...currentDiagnoses, diagnosisId];
        handleDiagnosesChange(newDiagnoses);
      },
      onClear: () => handleDiagnosesChange([])
    },
    { 
      key: 'medications', 
      label: 'Medication',
      icon: '/svg/Medications.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'is-any-of', label: 'Is any of' }
      ],
      values: allPossibleMedications.map(med => ({ id: med, label: med })),
      value: null,
      onValueChange: (value: string | null) => {
        // Medication filter - multiselect
        const currentMedications = filters.medications?.values || [];
        const medicationId = value as string;
        const newMedications = currentMedications.includes(medicationId)
          ? currentMedications.filter(m => m !== medicationId)
          : [...currentMedications, medicationId];
        handleMedicationsChange(newMedications);
      },
      onClear: () => handleMedicationsChange([])
    }
  ], [allPossibleDiagnoses, allPossibleMedications, filters.medical, filters.diagnoses?.values, filters.medications?.values]);
  
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
    if (filters.author?.values?.length) activeFilterKeys.add('author');
    if (filters.facility?.values?.length) activeFilterKeys.add('facility');
    if (filters.labs?.values?.length) activeFilterKeys.add('labs');
    
    // Define all available filters for More Filters menu
    // NOTE: Pinned filters (Medical Entity, Diagnosis, Medication) and Date are NOT included here
    const allAvailableFilters = [
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
        onClear: () => handleDocTypeChange([])
      },
      {
        key: 'author',
        label: 'Author',
        icon: '/svg/profile.svg',
        type: 'multiselect' as const,
        values: allPossibleAuthors.map(author => ({ id: author, label: author })),
        onValueChange: (valueId: string) => {
          const currentAuthors = filters.author?.values || [];
          const newAuthors = currentAuthors.includes(valueId) 
            ? currentAuthors.filter((a: string) => a !== valueId)
            : [...currentAuthors, valueId];
          handleAuthorChange(newAuthors);
        },
        onClear: () => handleAuthorChange([])
      },
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
        onClear: () => handleFacilityChange([])
      },
      {
        key: 'labs',
        label: 'Labs',
        icon: '/svg/Labs.svg',
        type: 'multiselect' as const,
        values: allPossibleLabs.map(lab => ({ id: lab, label: lab })),
        onValueChange: (valueId: string) => {
          const currentLabs = filters.labs?.values || [];
          const newLabs = currentLabs.includes(valueId) 
            ? currentLabs.filter((l: string) => l !== valueId)
            : [...currentLabs, valueId];
          handleLabsChange(newLabs);
        },
        onClear: () => handleLabsChange([])
      }
    ];
    
    // Filter out active filters
    return allAvailableFilters.filter(filter => !activeFilterKeys.has(filter.key));
  };
  
  const moreFilters = getMoreFilters();
  
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
            
            if (filter.key === 'medical') {
              const medical = filters.medical || { medications: [], diagnoses: [], labs: [] };
              hasValue = (medical.medications?.length || 0) > 0 || 
                        (medical.diagnoses?.length || 0) > 0 || 
                        (medical.labs?.length || 0) > 0;
              if (hasValue) {
                activeFilter = getActiveFiltersInOrder().find(f => f.type === 'medical');
              }
            } else if (filter.key === 'diagnoses') {
              hasValue = (filters.diagnoses?.values || []).length > 0;
              if (hasValue) {
                activeFilter = getActiveFiltersInOrder().find(f => f.type === 'diagnoses');
              }
            } else if (filter.key === 'medications') {
              hasValue = (filters.medications?.values || []).length > 0;
              if (hasValue) {
                activeFilter = getActiveFiltersInOrder().find(f => f.type === 'medications');
              }
            }
            
            // If filter has a value, render the pill in this position
            if (hasValue && activeFilter) {
              if (filter.key === 'medical') {
                return (
                  <FilterRulePill
                    key={`medical-${JSON.stringify(activeFilter.data)}`}
                    label="Medical Entity"
                    icon={<img src="/svg/cells.svg" alt="Medical Entity" width="16" height="16" />}
                    operators={[
                      { id: 'has', label: 'Has' },
                      { id: 'has-any-of', label: 'Has any of' }
                    ]}
                    values={[
                      { id: 'medications', label: 'Medications' },
                      { id: 'diagnoses', label: 'Diagnoses' },
                      { id: 'labs', label: 'Labs' }
                    ]}
                    value={(() => {
                      const medical = activeFilter.data || { medications: [], diagnoses: [], labs: [] };
                      const selectedValues = [];
                      if (medical.medications?.length) selectedValues.push('medications');
                      if (medical.diagnoses?.length) selectedValues.push('diagnoses');
                      if (medical.labs?.length) selectedValues.push('labs');
                      return selectedValues;
                    })()}
                    multiple={true}
                    onValueChange={(value: string[] | string | null) => {
                      const selectedCategories = value as string[] || [];
                      const medications = selectedCategories.includes('medications') ? ['Aspirin', 'Metformin'] : [];
                      const diagnoses = selectedCategories.includes('diagnoses') ? ['Diabetes', 'Hypertension'] : [];
                      const labs = selectedCategories.includes('labs') ? ['Blood Test', 'Urine Test'] : [];
                      handleMedicalChange({ medications, diagnoses, labs });
                    }}
                    onClear={() => handleMedicalChange({})}
                    openValueMenuInitially={newlyCreatedPills.has('medical')}
                    onDropdownClose={() => handleFilterDropdownClose('medical')}
                  />
                );
              } else if (filter.key === 'diagnoses') {
                return (
                  <MultiselectFilter
                    key="diagnoses"
                    label="Diagnosis"
                    icon={<img src="/svg/Diagnosis.svg" alt="Diagnosis" width="16" height="16" />}
                    values={allPossibleDiagnoses.map(diag => ({ id: diag, label: diag }))}
                    selectedValues={activeFilter.data?.values || []}
                    onValueChange={handleDiagnosesChange}
                    onClear={() => handleDiagnosesChange([])}
                    onOperatorChange={handleDiagnosesOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('diagnoses')}
                    onDropdownClose={() => handleFilterDropdownClose('diagnoses')}
                  />
                );
              } else if (filter.key === 'medications') {
                return (
                  <MultiselectFilter
                    key="medications"
                    label="Medication"
                    icon={<img src="/svg/Medications.svg" alt="Medication" width="16" height="16" />}
                    values={allPossibleMedications.map(med => ({ id: med, label: med }))}
                    selectedValues={activeFilter.data?.values || []}
                    onValueChange={handleMedicationsChange}
                    onClear={() => handleMedicationsChange([])}
                    onOperatorChange={handleMedicationsOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('medications')}
                    onDropdownClose={() => handleFilterDropdownClose('medications')}
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
          
          {/* Show dashed buttons for newly created non-pinned filters that don't have values yet */}
          {Array.from(newlyCreatedPills).filter(key => !['medical', 'diagnoses', 'medications'].includes(key)).map(filterKey => {
            // Check if this filter already has a value (in which case it will be rendered as a pill below)
            const hasValue = filterHasValues(filterKey);
            if (hasValue) return null; // Skip - will be rendered as pill below
            
            // Get filter metadata
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
          
          {/* Show other active filter pills (NOT pinned filters) AFTER the 3 pinned positions */}
          {getActiveFiltersInOrder().filter(f => f.type !== 'medical' && f.type !== 'diagnoses' && f.type !== 'medications').map(filter => {
            switch (filter.type) {
              case 'date':
                return (
                  <FilterRulePill
                    key="date"
                    label="Date"
                    icon={<img src="/svg/calendar0321.svg" alt="Date" width="16" height="16" />}
                    operators={[
                      { id: 'is', label: 'Is' },
                      { id: 'is-not', label: 'Is not' },
                      { id: 'is-after', label: 'Is after' },
                      { id: 'is-before', label: 'Is before' }
                    ]}
                    openValueMenuInitially={newlyCreatedPills.has('date')}
                    values={[
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: 'last-week', label: 'Last week' },
                      { id: 'last-month', label: 'Last month' },
                      { id: 'custom', label: 'Custom' }
                    ]}
                    value={filter.data?.start || filter.data?.end ? ['custom'] : []}
                    onValueChange={(value: string[] | string | null) => {
                      if ((value as string[])?.includes('custom')) {
                        handleDateChange({ start: '2024-01-01', end: '2024-12-31' });
                      } else {
                        handleDateChange({});
                      }
                    }}
                    onClear={() => handleDateChange({})}
                    onDropdownClose={() => handleFilterDropdownClose('date')}
                  />
                );
              
              case 'facility':
                return (
                  <MultiselectFilter
                    key="facility"
                    label="Facility"
                    icon={<img src="/svg/View.svg" alt="Facility" width="16" height="16" />}
                    values={allPossibleFacilities.map(facility => ({ id: facility, label: facility }))}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleFacilityChange}
                    onClear={() => handleFacilityChange([])}
                    onOperatorChange={handleFacilityOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('facility')}
                    onDropdownClose={() => handleFilterDropdownClose('facility')}
                  />
                );
              
              case 'medical':
                return (
                  <FilterRulePill
                    key={`medical-${JSON.stringify(filter.data)}`}
                    label="Medical Entity"
                    icon={<img src="/svg/cells.svg" alt="Medical Entity" width="16" height="16" />}
                    operators={[
                      { id: 'has', label: 'Has' },
                      { id: 'has-any-of', label: 'Has any of' }
                    ]}
                    values={[
                      { id: 'medications', label: 'Medications' },
                      { id: 'diagnoses', label: 'Diagnoses' },
                      { id: 'labs', label: 'Labs' }
                    ]}
                    value={(() => {
                      const medical = filter.data || { medications: [], diagnoses: [], labs: [] };
                      const selectedValues = [];
                      if (medical.medications?.length) selectedValues.push('medications');
                      if (medical.diagnoses?.length) selectedValues.push('diagnoses');
                      if (medical.labs?.length) selectedValues.push('labs');
                      return selectedValues;
                    })()}
                    multiple={true}
                    onValueChange={(value: string[] | string | null) => {
                      const selectedCategories = value as string[] || [];
                      const medications = selectedCategories.includes('medications') ? ['Aspirin', 'Metformin'] : [];
                      const diagnoses = selectedCategories.includes('diagnoses') ? ['Diabetes', 'Hypertension'] : [];
                      const labs = selectedCategories.includes('labs') ? ['Blood Test', 'Urine Test'] : [];
                      handleMedicalChange({ medications, diagnoses, labs });
                    }}
                    onClear={() => handleMedicalChange({})}
                    openValueMenuInitially={newlyCreatedPills.has('medical')}
                    onDropdownClose={() => handleFilterDropdownClose('medical')}
                  />
                );
              
              case 'author':
                return (
                  <MultiselectFilter
                    key="author"
                    label="Author"
                    icon={<img src="/svg/profile.svg" alt="Author" width="16" height="16" />}
                    values={allPossibleAuthors.map(author => ({ id: author, label: author }))}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleAuthorChange}
                    onClear={() => handleAuthorChange([])}
                    onOperatorChange={handleAuthorOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('author')}
                    onDropdownClose={() => handleFilterDropdownClose('author')}
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
                    onClear={() => handleDocTypeChange([])}
                    onOperatorChange={handleDocTypeOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('docType')}
                    onDropdownClose={() => handleFilterDropdownClose('docType')}
                  />
                );
              
              case 'medications':
                return (
                  <MultiselectFilter
                    key="medications"
                    label="Medication"
                    icon={<img src="/svg/Medications.svg" alt="Medication" width="16" height="16" />}
                    values={medicationValues}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleMedicationsChange}
                    onClear={() => handleMedicationsChange([])}
                    onOperatorChange={handleMedicationsOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('medications')}
                    onDropdownClose={() => handleFilterDropdownClose('medications')}
                  />
                );
              
              case 'diagnoses':
                return (
                  <MultiselectFilter
                    key="diagnoses"
                    label="Diagnosis"
                    icon={<img src="/svg/Diagnosis.svg" alt="Diagnosis" width="16" height="16" />}
                    values={diagnosisValues}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleDiagnosesChange}
                    onClear={() => handleDiagnosesChange([])}
                    onOperatorChange={handleDiagnosesOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('diagnoses')}
                    onDropdownClose={() => handleFilterDropdownClose('diagnoses')}
                  />
                );
              
              case 'labs':
                return (
                  <MultiselectFilter
                    key="labs"
                    label="Labs"
                    icon={<img src="/svg/Labs.svg" alt="Labs" width="16" height="16" />}
                    values={labValues}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleLabsChange}
                    onClear={() => handleLabsChange([])}
                    onOperatorChange={handleLabsOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('labs')}
                    onDropdownClose={() => handleFilterDropdownClose('labs')}
                  />
                );
              
              default:
                return null;
            }
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
                            
                            // Mark as newly created and open the dropdown
                            // Don't create the filter yet - it will be created when a value is selected
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
              <ClearButton onClick={clearFilters}>
                <img src="/svg/cancelCircle.svg" alt="Clear" width="16" height="16" />
                Clear
              </ClearButton>
            )}
            </ActionsContainer>
            </FilterPillsContainer>
          </FilterRow>
          
          {/* Quick Filter Menus */}
          {activeQuickFilter && (() => {
            const filter = quickFilters.find(f => f.key === activeQuickFilter);
            if (!filter) return null;
            
            // Determine if this is a multiselect filter
            const isMultiselect = filter.key === 'medical' || filter.key === 'diagnoses' || filter.key === 'medications';
            
            const filteredValues = getFilteredMenuItems(filter);
            
            // Determine if search input should be shown (only for filters with many options)
            const shouldShowSearch = (filter.key === 'diagnoses' && allPossibleDiagnoses.length > 5) ||
                                   (filter.key === 'medications' && allPossibleMedications.length > 5) ||
                                   (filter.key === 'docType' && allPossibleTypes.length > 5);
            // Medical Entity doesn't need search - only has 3 options (Medications, Diagnoses, Labs)
            
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
                    if (filter.key === 'diagnoses') {
                      isSelected = (filters.diagnoses?.values || []).includes(value.id);
                    } else if (filter.key === 'medications') {
                      isSelected = (filters.medications?.values || []).includes(value.id);
                    } else if (filter.key === 'medical') {
                      const medical = filters.medical || { medications: [], diagnoses: [], labs: [] };
                      if (value.id === 'medications') {
                        isSelected = (medical.medications || []).length > 0;
                      } else if (value.id === 'diagnoses') {
                        isSelected = (medical.diagnoses || []).length > 0;
                      } else if (value.id === 'labs') {
                        isSelected = (medical.labs || []).length > 0;
                      }
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
        </FilterBarContainer>
      );
    }
