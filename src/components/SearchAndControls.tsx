import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SearchAndControlsProps } from '../types/Timeline';
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
  padding: 8px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.3s ease;
  
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
  isPreviewVisible = false
}) => {
  const [currentYear, setCurrentYear] = useState(propCurrentYear);
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth);
  const [currentDay, setCurrentDay] = useState(propCurrentDay);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [highlightedDate, setHighlightedDate] = useState<Date | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

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
      </ControlsRow>
    </SearchControlsContainer>
  );
};

export default SearchAndControls;
