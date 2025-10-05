import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SearchAndControlsProps } from '../types/Timeline';
import DatePicker from './DatePicker';

const SearchControlsContainer = styled.div`
  background: white;
  padding: 20px 24px;
  overflow: hidden; /* Prevent horizontal scrolling */
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  font-weight: 600;
  color: #111827;
`;

const YearDropdown = styled.select`
  background: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 700;
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
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  cursor: pointer;
  
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
  z-index: 10000;
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
  onManualNavigationStart
}) => {
  const [currentYear, setCurrentYear] = useState(propCurrentYear);
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth);
  const [currentDay, setCurrentDay] = useState(propCurrentDay);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
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

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerVisible(false);
      }
    };

    if (isDatePickerVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerVisible]);

  const handlePrevYear = () => {
    onManualNavigationStart?.();
    const minYear = Math.min(...docs.map(doc => new Date(doc.date).getFullYear()));
    const newYear = currentYear - 1;
    
    if (newYear >= minYear) {
      setCurrentYear(newYear);
      onScrub(new Date(newYear, 0, 1));
      onYearChange?.(newYear);
    }
  };

  const handleNextYear = () => {
    onManualNavigationStart?.();
    const maxYear = Math.max(...docs.map(doc => new Date(doc.date).getFullYear()));
    const newYear = currentYear + 1;
    
    if (newYear <= maxYear) {
      setCurrentYear(newYear);
      onScrub(new Date(newYear, 0, 1));
      onYearChange?.(newYear);
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
      onScrub(new Date(newYear, newMonth, 1));
      onYearChange?.(newYear);
      onMonthChange?.(newMonth);
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
      onScrub(new Date(newYear, newMonth, 1));
      onYearChange?.(newYear);
      onMonthChange?.(newMonth);
    }
  };

  const handleDatePickerToggle = () => {
    setIsDatePickerVisible(!isDatePickerVisible);
  };

  const handleDateSelect = (date: Date) => {
    onManualNavigationStart?.();
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
    setCurrentDay(date.getDate());
    onScrub(date);
    onYearChange?.(date.getFullYear());
    onMonthChange?.(date.getMonth());
  };

  const handleDatePickerClose = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <SearchControlsContainer>
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
                  onScrub(new Date(newYear, 0, 1));
                  onYearChange?.(newYear);
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
                <MonthDropdown onClick={handleDatePickerToggle}>
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
