import React, { useState } from 'react';
import styled from 'styled-components';
import { Popover } from '../design-system/adapters';
import FilterRulePill from '../components/FilterRulePill/FilterRulePill';
import MultiselectFilter from '../components/MultiselectFilter';
import { useSearch } from '../features/search/SearchCtx';
import { useDropdown } from '../contexts/DropdownContext';

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
  padding: 8px 40px 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px; /* Updated to radius 10 */
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  color: #374151;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.hasFilters ? '#E5E7EB' : '#ffffff'};
  border: ${props => props.hasFilters ? 'none' : '1px solid #e5e7eb'};
  border-radius: 10px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.hasFilters ? '#D1D5DB' : '#f9fafb'};
  }
  
  &:active {
    background: ${props => props.hasFilters ? '#9CA3AF' : '#f3f4f6'};
  }
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  &:active {
    background: #f3f4f6;
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
  const { filters, setFilters, results, clearFilters, query, setQuery } = useSearch();
  const [newlyCreatedPills, setNewlyCreatedPills] = useState<Set<string>>(new Set());
  const { setOpenDropdown } = useDropdown();
  
  // State for quick filter menus
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = React.useState<string>('');
  const [showFilterSection, setShowFilterSection] = React.useState<boolean>(false);
  const quickFilterRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
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
  
  // Clear newly created pills state after they've been rendered
  React.useEffect(() => {
    if (newlyCreatedPills.size > 0) {
      const timer = setTimeout(() => {
        setNewlyCreatedPills(new Set());
      }, 100); // Small delay to ensure the pill renders with open menu
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedPills]);
  
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
    }
  }, [activeQuickFilter]);
  
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
    const newFilters = { ...filters, medical: medicalValue };
    if (medicalValue.medications?.length || medicalValue.diagnoses?.length || medicalValue.labs?.length) {
      // Adding or updating medical filter
      const updatedFilters = addToCreationOrder('medical', newFilters);
      setFilters({ ...updatedFilters, medical: { ...medicalValue, createdAt: Date.now() } });
    } else {
      // Removing medical filter
      const updatedFilters = removeFromCreationOrder('medical', newFilters);
      setFilters(updatedFilters);
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
  
  
  // Define quick filters (always visible when no active filters)
  const quickFilters = React.useMemo(() => [
    { 
      key: 'author', 
      label: 'Author',
      icon: '/svg/profile.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'is-any-of', label: 'Is any of' }
      ],
      values: allPossibleAuthors.map(author => ({ id: author, label: author })),
      value: null, // Always null for quick filters
      onValueChange: (value: string[] | string | null) => {
        // For multiselect, add the new value to existing selection
        const currentAuthors = filters.author?.values || [];
        const newValue = Array.isArray(value) ? value[0] : value;
        if (newValue && !currentAuthors.includes(newValue)) {
          handleAuthorChange([...currentAuthors, newValue]);
        } else if (newValue && currentAuthors.includes(newValue)) {
          // Remove if already selected
          handleAuthorChange(currentAuthors.filter(a => a !== newValue));
        }
      },
      onClear: () => handleAuthorChange([])
    },
    { 
      key: 'facility', 
      label: 'Facility',
      icon: '/svg/View.svg',
      operators: [
        { id: 'is', label: 'Is' },
        { id: 'is-any-of', label: 'Is any of' }
      ],
      values: allPossibleFacilities.map(facility => ({ id: facility, label: facility })),
             value: null, // Always null for quick filters
      onValueChange: (value: string[] | string | null) => {
        // For multiselect, add the new value to existing selection
        const currentFacilities = filters.facility?.values || [];
        const newValue = Array.isArray(value) ? value[0] : value;
        if (newValue && !currentFacilities.includes(newValue)) {
          handleFacilityChange([...currentFacilities, newValue]);
        } else if (newValue && currentFacilities.includes(newValue)) {
          // Remove if already selected
          handleFacilityChange(currentFacilities.filter(f => f !== newValue));
        }
      },
      onClear: () => handleFacilityChange([])
    },
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
      value: null, // Always null for quick filters
      onValueChange: (value: string[] | string | null) => {
        // For multiselect, add the new value to existing selection
        const currentMedical = filters.medical || { medications: [], diagnoses: [], labs: [] };
        const newValue = Array.isArray(value) ? value[0] : value;
        
        if (newValue === 'medications') {
          const currentMeds = currentMedical.medications || [];
          if (currentMeds.length === 0) {
            // Add some sample medications if none exist
            handleMedicalChange({ 
              ...currentMedical, 
              medications: ['Aspirin', 'Metformin'] 
            });
          } else {
            // Remove medications if already selected
            handleMedicalChange({ 
              ...currentMedical, 
              medications: [] 
            });
          }
        } else if (newValue === 'diagnoses') {
          const currentDiag = currentMedical.diagnoses || [];
          if (currentDiag.length === 0) {
            // Add some sample diagnoses if none exist
            handleMedicalChange({ 
              ...currentMedical, 
              diagnoses: ['Diabetes', 'Hypertension'] 
            });
          } else {
            // Remove diagnoses if already selected
            handleMedicalChange({ 
              ...currentMedical, 
              diagnoses: [] 
            });
          }
        } else if (newValue === 'labs') {
          const currentLabs = currentMedical.labs || [];
          if (currentLabs.length === 0) {
            // Add some sample labs if none exist
            handleMedicalChange({ 
              ...currentMedical, 
              labs: ['Blood Test', 'Urine Test'] 
            });
          } else {
            // Remove labs if already selected
            handleMedicalChange({ 
              ...currentMedical, 
              labs: [] 
            });
          }
        }
      },
      onClear: () => handleMedicalChange({})
    }
  ], [allPossibleAuthors, allPossibleFacilities, filters.author?.values, filters.facility?.values, filters.medical, handleAuthorChange, handleFacilityChange, handleMedicalChange]);
  
  // Auto-focus search input when menu opens
  React.useEffect(() => {
    if (menuVisible && activeQuickFilter) {
      const filter = quickFilters.find(f => f.key === activeQuickFilter);
      if (filter) {
        const shouldShowSearch = (filter.key === 'facility' && allPossibleFacilities.length > 5) ||
                               (filter.key === 'author' && allPossibleAuthors.length > 5) ||
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
  }, [menuVisible, activeQuickFilter, allPossibleFacilities.length, allPossibleAuthors.length, allPossibleTypes.length, quickFilters]);
  
  // Handle filter section toggle
  const handleFilterSectionToggle = () => {
    setShowFilterSection(!showFilterSection);
  };
  
  // Get filters that are not currently active as pills
  const getMoreFilters = () => {
    const activeFilterKeys = new Set();
    
    // Check which filters are currently active
    if (filters.date?.start || filters.date?.end) activeFilterKeys.add('date');
    if (filters.facility?.values?.length) activeFilterKeys.add('facility');
    if (filters.medical?.medications?.length || filters.medical?.diagnoses?.length || filters.medical?.labs?.length) activeFilterKeys.add('medical');
    if (filters.author?.values?.length) activeFilterKeys.add('author');
    if (filters.docType?.values?.length) activeFilterKeys.add('docType');
    
    // When quick filters are visible (no active filters), show all available filters in More filters
    if (!hasActiveFilters) {
      // Add additional filters that are always available in More filters menu
      const additionalFilters = [
        {
          key: 'docType',
          label: 'Doc type',
          icon: '/svg/Document.svg',
          type: 'multiselect' as const,
          values: allPossibleTypes.map(type => ({ id: type, label: type })),
          onValueChange: (valueId: string) => {
            const currentTypes = filters.docType?.values || [];
            const newTypes = currentTypes.includes(valueId) 
              ? currentTypes.filter(t => t !== valueId)
              : [...currentTypes, valueId];
            handleDocTypeChange(newTypes);
          },
          onClear: () => handleDocTypeChange([])
        }
      ];
      
      // Return all quick filters plus additional filters when no filters are active
      return [...quickFilters, ...additionalFilters];
    }
    
    // When filters are active, only show inactive filters
    const inactiveQuickFilters = quickFilters.filter(filter => !activeFilterKeys.has(filter.key));
    
    // Add additional filters that are always available in More filters menu
    const additionalFilters = [
      {
        key: 'docType',
        label: 'Doc type',
        icon: '/svg/Document.svg',
        type: 'multiselect' as const,
        values: allPossibleTypes.map(type => ({ id: type, label: type })),
        onValueChange: (valueId: string) => {
          const currentTypes = filters.docType?.values || [];
          const newTypes = currentTypes.includes(valueId) 
            ? currentTypes.filter(t => t !== valueId)
            : [...currentTypes, valueId];
          handleDocTypeChange(newTypes);
        },
        onClear: () => handleDocTypeChange([])
      }
    ];
    
    // Filter out active additional filters
    const inactiveAdditionalFilters = additionalFilters.filter(filter => !activeFilterKeys.has(filter.key));
    
    // Combine inactive quick filters with inactive additional filters
    return [...inactiveQuickFilters, ...inactiveAdditionalFilters];
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
            </FiltersButton>
          </SearchRow>
          
          {/* Filter pills row */}
          <FilterRow isVisible={showFilterSection}>
            <FilterPillsContainer>
          {/* Show active filter pills in creation order */}
          {getActiveFiltersInOrder().map(filter => {
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
                  />
                );
              
              case 'docType':
                return (
                  <MultiselectFilter
                    key="docType"
                    label="Doc Type"
                    icon={<img src="/svg/profile.svg" alt="Doc Type" width="16" height="16" />}
                    values={allPossibleTypes.map(type => ({ id: type, label: type }))}
                    selectedValues={filter.data?.values || []}
                    onValueChange={handleDocTypeChange}
                    onClear={() => handleDocTypeChange([])}
                    onOperatorChange={handleDocTypeOperatorChange}
                    openValueMenuInitially={newlyCreatedPills.has('docType')}
                  />
                );
              
              default:
                return null;
            }
          })}
          
          {/* Show quick filters only when no filters are active */}
          {!hasActiveFilters && quickFilters.map(filter => (
            <QuickFilterButton
              key={filter.key}
              ref={(el) => {
                quickFilterRefs.current[filter.key] = el;
              }}
              onClick={() => {
                setActiveQuickFilter(activeQuickFilter === filter.key ? null : filter.key);
              }}
            >
              <img src={filter.icon} alt={filter.label} width="16" height="16" />
              {filter.label}
            </QuickFilterButton>
          ))}
          
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
                            
                            // Handle different filter types - Create pills without values, then open value menu
                            if (filter.key === 'date') {
                              // Date filter - create pill without value, mark as newly created
                              setNewlyCreatedPills(prev => {
                                const newSet = new Set(prev);
                                newSet.add('date');
                                return newSet;
                              });
                              // Add to creation order and create empty filter
                              const newFilters = addToCreationOrder('date', { ...filters, date: {} });
                              setFilters(newFilters);
                            } else if (filter.key === 'facility') {
                              // Facility filter - create pill without value, mark as newly created
                              setNewlyCreatedPills(prev => {
                                const newSet = new Set(prev);
                                newSet.add('facility');
                                return newSet;
                              });
                              // Add to creation order and create empty filter
                              const newFilters = addToCreationOrder('facility', { ...filters, facility: { values: [] } });
                              setFilters(newFilters);
                            } else if (filter.key === 'medical') {
                              // Medical Entity filter - create pill without value, mark as newly created
                              setNewlyCreatedPills(prev => {
                                const newSet = new Set(prev);
                                newSet.add('medical');
                                return newSet;
                              });
                              // Add to creation order and create empty filter
                              const newFilters = addToCreationOrder('medical', { ...filters, medical: { medications: [], diagnoses: [], labs: [] } });
                              setFilters(newFilters);
                            } else if (filter.key === 'author') {
                              // Author filter - create pill without value, mark as newly created
                              setNewlyCreatedPills(prev => {
                                const newSet = new Set(prev);
                                newSet.add('author');
                                return newSet;
                              });
                              // Add to creation order and create empty filter
                              const newFilters = addToCreationOrder('author', { ...filters, author: { values: [] } });
                              setFilters(newFilters);
                            } else if (filter.key === 'docType') {
                              // DocType filter - create pill without value, mark as newly created
                              setNewlyCreatedPills(prev => {
                                const newSet = new Set(prev);
                                newSet.add('docType');
                                return newSet;
                              });
                              // Add to creation order and create empty filter
                              const newFilters = addToCreationOrder('docType', { ...filters, docType: { values: [] } });
                              setFilters(newFilters);
                            }
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
            const isMultiselect = filter.key === 'facility' || filter.key === 'medical' || filter.key === 'author';
            
            const filteredValues = getFilteredMenuItems(filter);
            
            // Determine if search input should be shown (only for filters with many options)
            const shouldShowSearch = (filter.key === 'facility' && allPossibleFacilities.length > 5) ||
                                   (filter.key === 'author' && allPossibleAuthors.length > 5) ||
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
                <div style={{
                  maxHeight: shouldShowSearch ? '50vh' : '60vh',
                  overflowY: 'auto',
                  /* Remove scrollbar borders */
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#e5e7eb transparent'
                }}>
                  {filteredValues.map(value => {
                    // Determine if this value is currently selected
                    let isSelected = false;
                    if (filter.key === 'facility') {
                      isSelected = (filters.facility?.values || []).includes(value.id);
                    } else if (filter.key === 'author') {
                      isSelected = (filters.author?.values || []).includes(value.id);
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
                        isSelected={isSelected}
                        onClick={() => {
                          // Apply the filter value (handles multiselect internally)
                          filter.onValueChange?.(value.id);
                          
                          // Always close menu after selection to create pill
                          setActiveQuickFilter(null);
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
