import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SearchAndControlsProps, ViewMode } from '../types/Timeline';
import DatePicker from './DatePicker';
import { FilterBar } from '../filters/FilterBar';

const SearchControlsContainer = styled.div<{ isPreviewVisible?: boolean }>`
  background: white;
  padding: 0 24px; /* Remove all vertical padding from container */
  overflow: visible; /* Allow date picker to be visible */
  position: relative;
  z-index: 1000; /* High z-index to ensure date picker is above minimap, but lower than filter dropdowns */
  margin-right: ${props => props.isPreviewVisible ? '620px' : '0'};
  transition: margin-right 0.3s ease;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 8px 0; /* 8px top and bottom padding for timeframe section */
  position: relative; /* Enable z-index stacking */
  z-index: 50; /* Lower than filters section */
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
`;

const ViewByContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewByLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const ViewByDropdownButton = styled.button<{ isOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 158px;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  span {
    flex: 1;
    text-align: left;
  }
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ViewByDropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 8px;
  z-index: 50001;
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.2s ease;
  max-height: 280px;
  overflow-y: auto;
`;

const ViewByMenuItem = styled.button<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 4px;
  background: ${props => props.isSelected ? '#e0f2fe' : 'transparent'};
  border: none;
  border-radius: 10px;
  text-align: left;
  font-size: 14px;
  font-weight: ${props => props.isSelected ? 500 : 400};
  color: ${props => props.isSelected ? '#2582ff' : '#1f2937'};
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  img {
    flex-shrink: 0;
    ${props => props.isSelected && `
      filter: brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(3261%) hue-rotate(202deg) brightness(102%) contrast(101%);
    `}
  }
  
  &:hover {
    background: ${props => props.isSelected ? '#e0f2fe' : '#f9fafb'};
  }
`;

const ChevronIcon = styled.svg<{ isOpen?: boolean }>`
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
  flex-shrink: 0;
`;


const YearChip = styled.div`
  background: white;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const YearDropdown = styled.select`
  background: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  &:focus {
    outline: none;
    background-color: #f3f4f6;
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;


const MonthDropdown = styled.div`
  background: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px; /* Symmetrical padding on left and right */
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 168px; /* Fixed width to accommodate "December 9999" + 8px extra padding */
  text-align: left;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  &:focus {
    outline: none;
    background-color: #f3f4f6;
  }
`;

const MonthDropdownContainer = styled.div`
  position: relative;
  z-index: 50002; /* Even higher to be above all other elements */
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    color: #111827;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TimeframeSegmented = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
`;

const TimeframeOption = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.isActive ? 'white' : 'transparent'};
  color: #1F2937;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.isActive ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'};
  
  &:hover {
    background: ${props => props.isActive ? 'white' : '#e5e7eb'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchAndControls: React.FC<SearchAndControlsProps> = ({
  scale,
  onScaleChange,
  onScrub,
  range,
  docs,
  onYearChange,
  onMonthChange,
  onDayChange,
  currentYear: propCurrentYear = 2021,
  currentMonth: propCurrentMonth = 0,
  currentDay: propCurrentDay = 1,
  onManualNavigationStart,
  onHighlightedDate,
  scrollToDateRef,
  isPreviewVisible = false,
  viewMode = 'titles',
  onViewModeChange
}) => {
  const [currentYear, setCurrentYear] = useState(propCurrentYear);
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth);
  const [currentDay, setCurrentDay] = useState(propCurrentDay);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [highlightedDate, setHighlightedDate] = useState<Date | null>(null);
  const [isViewByDropdownOpen, setIsViewByDropdownOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const viewByRef = useRef<HTMLDivElement>(null);
  
  // View By dropdown data
  const viewModeLabels: Record<ViewMode, string> = {
    titles: 'Titles',
    medications: 'Medications',
    diagnosis: 'Diagnoses',
    labs: 'Lab Results'
  };
  
  const viewModeIcons: Record<ViewMode, string> = {
    titles: '/svg/Document.svg',
    medications: '/svg/Medications.svg',
    diagnosis: '/svg/Diagnosis.svg',
    labs: '/svg/Labs.svg'
  };
  
  const handleViewModeSelect = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    setIsViewByDropdownOpen(false);
  };

  // Sync with props
  useEffect(() => {
    setCurrentYear(propCurrentYear);
  }, [propCurrentYear]);

  useEffect(() => {
    setCurrentMonth(propCurrentMonth);
  }, [propCurrentMonth]);

  useEffect(() => {
    setCurrentDay(propCurrentDay);
  }, [propCurrentDay]);

  // Handle click outside to close date picker - PORTAL SAFE VERSION
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('🔍 Click outside check - event.target:', event.target);
      console.log('🔍 Click outside check - event.composedPath:', event.composedPath());
      
      // Get the DatePicker container from the portal
      const datePickerElement = document.querySelector('[data-datepicker-container]');
      console.log('🔍 DatePicker element found:', datePickerElement);
      
      // Check if click is inside trigger or DatePicker using composedPath
      const path = (event.composedPath && event.composedPath()) || [];
      const isInsideTrigger = datePickerRef.current && path.includes(datePickerRef.current as EventTarget);
      const isInsideDatePicker = datePickerElement && path.includes(datePickerElement as EventTarget);
      
      console.log('🔍 Is inside trigger:', isInsideTrigger);
      console.log('🔍 Is inside DatePicker:', isInsideDatePicker);
      
      // Only close if click is outside both trigger and DatePicker
      if (!isInsideTrigger && !isInsideDatePicker) {
        console.log('🔍 Closing DatePicker - click was outside');
        setIsDatePickerVisible(false);
      } else {
        console.log('🔍 Keeping DatePicker open - click was inside');
      }
    };

    if (isDatePickerVisible) {
      // Use pointerdown for better event handling, attach in bubble phase
      document.addEventListener('pointerdown', handleClickOutside, { capture: false });
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isDatePickerVisible]);

  // Handle click outside to close ViewBy dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewByRef.current && !viewByRef.current.contains(event.target as Node)) {
        setIsViewByDropdownOpen(false);
      }
    };

    if (isViewByDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isViewByDropdownOpen]);

  const handlePrevYear = () => {
    onManualNavigationStart?.();
    const minYear = Math.min(...docs.map(doc => new Date(doc.date).getFullYear()));
    const newYear = currentYear - 1;
    
    if (newYear >= minYear) {
      setCurrentYear(newYear);
      const targetDate = new Date(newYear, 0, 1); // January 1st of the new year
      onScrub(targetDate);
      onYearChange?.(newYear);
      
      // Trigger scrolling to the beginning of the new year
      setTimeout(() => {
        if (scrollToDateRef?.current) {
          console.log('Scrolling to beginning of year:', newYear);
          scrollToDateRef.current(targetDate);
        }
      }, 100);
    }
  };

  const handleNextYear = () => {
    onManualNavigationStart?.();
    const maxYear = Math.max(...docs.map(doc => new Date(doc.date).getFullYear()));
    const newYear = currentYear + 1;
    
    if (newYear <= maxYear) {
      setCurrentYear(newYear);
      const targetDate = new Date(newYear, 0, 1); // January 1st of the new year
      onScrub(targetDate);
      onYearChange?.(newYear);
      
      // Trigger scrolling to the beginning of the new year
      setTimeout(() => {
        if (scrollToDateRef?.current) {
          console.log('Scrolling to beginning of year:', newYear);
          scrollToDateRef.current(targetDate);
        }
      }, 100);
    }
  };

  const handlePrevMonth = () => {
    onManualNavigationStart?.();
    const minDate = new Date(Math.min(...docs.map(doc => new Date(doc.date).getTime())));
    const minYear = minDate.getFullYear();
    const minMonth = minDate.getMonth();
    
    let newYear = currentYear;
    let newMonth = currentMonth - 1;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    
    const newDate = new Date(newYear, newMonth, 1);
    const minDateStart = new Date(minYear, minMonth, 1);
    
    if (newDate >= minDateStart) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
      setCurrentDay(1);
      onScrub(newDate);
      onYearChange?.(newYear);
      onMonthChange?.(newMonth);
      
      // Trigger scrolling to the beginning of the new month
      setTimeout(() => {
        if (scrollToDateRef?.current) {
          console.log('Scrolling to beginning of month:', newYear, newMonth);
          scrollToDateRef.current(newDate);
        }
      }, 100);
    }
  };

  const handleNextMonth = () => {
    onManualNavigationStart?.();
    const maxDate = new Date(Math.max(...docs.map(doc => new Date(doc.date).getTime())));
    const maxYear = maxDate.getFullYear();
    const maxMonth = maxDate.getMonth();
    
    let newYear = currentYear;
    let newMonth = currentMonth + 1;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    
    const newDate = new Date(newYear, newMonth, 1);
    const maxDateStart = new Date(maxYear, maxMonth, 1);
    
    if (newDate <= maxDateStart) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
      setCurrentDay(1);
      onScrub(newDate);
      onYearChange?.(newYear);
      onMonthChange?.(newMonth);
      
      // Trigger scrolling to the beginning of the new month
      setTimeout(() => {
        if (scrollToDateRef?.current) {
          console.log('Scrolling to beginning of month:', newYear, newMonth);
          scrollToDateRef.current(newDate);
        }
      }, 100);
    }
  };

  const handleDatePickerToggle = () => {
    console.log('DatePicker toggle clicked, current state:', isDatePickerVisible);
    setIsDatePickerVisible(!isDatePickerVisible);
  };

  const handleDateSelect = (date: Date) => {
    onManualNavigationStart?.();
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
    setCurrentDay(date.getDate());
    onYearChange?.(date.getFullYear());
    onMonthChange?.(date.getMonth());
    
    // Trigger highlight effect
    setHighlightedDate(date);
    onHighlightedDate?.(date); // Notify parent component
    
    // Delay scrolling to ensure calendar has updated to new month/year
    setTimeout(() => {
      onScrub(date);
      // Use the ref to trigger scrolling in CalendarArea
      if (scrollToDateRef?.current) {
        console.log('Triggering scroll via ref for date:', date);
        scrollToDateRef.current(date);
      }
    }, 100); // Small delay to ensure calendar has updated
    
    setTimeout(() => {
      setHighlightedDate(null);
      onHighlightedDate?.(null); // Clear highlight after timeout
    }, 2000); // 2000ms highlight duration
  };

  const handleDatePickerClose = () => {
    console.log('DatePicker close called');
    setIsDatePickerVisible(false);
  };

  return (
    <SearchControlsContainer isPreviewVisible={isPreviewVisible}>
      {/* Search and Filter Bar */}
      <FilterBar />
      
      {/* Time Scale Controls */}
      <ControlsRow>
        <LeftControls>
          <TimeframeSegmented>
            <TimeframeOption
              isActive={scale === 'year'}
              onClick={() => onScaleChange('year')}
            >
              Year
            </TimeframeOption>
            <TimeframeOption
              isActive={scale === 'month'}
              onClick={() => onScaleChange('month')}
            >
              Month
            </TimeframeOption>
            <TimeframeOption
              isActive={scale === 'day'}
              onClick={() => onScaleChange('day')}
            >
              Day
            </TimeframeOption>
          </TimeframeSegmented>
          
          {scale === 'year' && (
            <YearChip>
              {Math.min(...docs.map(doc => new Date(doc.date).getFullYear()))} - {Math.max(...docs.map(doc => new Date(doc.date).getFullYear()))}
            </YearChip>
          )}
          
          {scale === 'month' && (
            <YearSelector>
              <YearDropdown 
                value={currentYear} 
                onChange={(e) => {
                  onManualNavigationStart?.();
                  const newYear = parseInt(e.target.value);
                  setCurrentYear(newYear);
                  const targetDate = new Date(newYear, 0, 1); // January 1st of the new year
                  onScrub(targetDate);
                  onYearChange?.(newYear);
                  
                  // Trigger scrolling to the beginning of the new year
                  setTimeout(() => {
                    if (scrollToDateRef?.current) {
                      console.log('Scrolling to beginning of year from dropdown:', newYear);
                      scrollToDateRef.current(targetDate);
                    }
                  }, 100);
                }}
              >
                {Array.from(new Set(docs.map(doc => new Date(doc.date).getFullYear())))
                  .sort((a, b) => a - b)
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </YearDropdown>
              <NavButton onClick={handlePrevYear} aria-label="Previous year">
                ‹
              </NavButton>
              <NavButton onClick={handleNextYear} aria-label="Next year">
                ›
              </NavButton>
            </YearSelector>
          )}
          
          {scale === 'day' && (
            <MonthSelector>
              <MonthDropdownContainer ref={datePickerRef}>
                <MonthDropdown 
                  onClick={handleDatePickerToggle}
                >
                  {new Date(currentYear, currentMonth, currentDay).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric'
                  })}
                </MonthDropdown>
                <DatePicker
                  selectedDate={new Date(currentYear, currentMonth, currentDay)}
                  docs={docs}
                  onDateSelect={handleDateSelect}
                  onClose={handleDatePickerClose}
                  isVisible={isDatePickerVisible}
                  triggerRef={datePickerRef}
                  highlightedDate={highlightedDate}
                />
              </MonthDropdownContainer>
              <NavButton onClick={handlePrevMonth} aria-label="Previous month">
                ‹
              </NavButton>
              <NavButton onClick={handleNextMonth} aria-label="Next month">
                ›
              </NavButton>
            </MonthSelector>
          )}
        </LeftControls>
        
        <RightControls>
          <ViewByContainer ref={viewByRef}>
            <ViewByLabel>View by</ViewByLabel>
            <ViewByDropdownButton
              isOpen={isViewByDropdownOpen}
              onClick={() => setIsViewByDropdownOpen(!isViewByDropdownOpen)}
            >
              <img src={viewModeIcons[viewMode]} alt={viewModeLabels[viewMode]} width="16" height="16" />
              <span>{viewModeLabels[viewMode]}</span>
              <ChevronIcon isOpen={isViewByDropdownOpen} viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </ChevronIcon>
            </ViewByDropdownButton>
            <ViewByDropdownMenu isOpen={isViewByDropdownOpen}>
              {(['titles', 'medications', 'diagnosis', 'labs'] as ViewMode[]).map((mode) => (
                <ViewByMenuItem
                  key={mode}
                  isSelected={viewMode === mode}
                  onClick={() => handleViewModeSelect(mode)}
                >
                  <img src={viewModeIcons[mode]} alt={viewModeLabels[mode]} width="16" height="16" />
                  {viewModeLabels[mode]}
                </ViewByMenuItem>
              ))}
            </ViewByDropdownMenu>
          </ViewByContainer>
        </RightControls>
      </ControlsRow>
    </SearchControlsContainer>
  );
};

export default SearchAndControls;
