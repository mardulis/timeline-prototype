import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { Doc } from '../types/Timeline';

const DatePickerContainer = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 16px;
  z-index: 50006; /* Above document preview panel (z-index: 50005) */
  min-width: 280px;
`;

const DatePickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const DropdownContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const YearDropdown = styled.select`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const MonthDropdown = styled.select`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const MonthOption = styled.option<{ hasDocuments: boolean }>`
  font-weight: ${props => props.hasDocuments ? '600' : '400'};
  color: ${props => props.hasDocuments ? '#1f2937' : '#6b7280'};
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #1f2937;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &:disabled {
    color: #9ca3af;
    cursor: not-allowed;
    
    &:hover {
      background: none;
    }
  }
`;

const DayLabelsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  padding: 4px;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DateButton = styled.button<{ 
  isSelected: boolean; 
  isCurrentMonth: boolean; 
  hasDocuments: boolean;
  isToday?: boolean;
}>`
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  font-weight: ${props => props.hasDocuments ? '600' : '400'}; // Only font weight difference
  cursor: pointer;
  color: ${props => {
    if (!props.isCurrentMonth) return '#9ca3af';
    if (props.hasDocuments) return '#1f2937'; // Primary color
    return '#6b7280'; // Secondary color
  }};
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    
    &:hover {
      background: transparent;
    }
  }
`;

interface DatePickerProps {
  selectedDate: Date;
  docs: Doc[];
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  isVisible: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
  highlightedDate?: Date | null;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  docs,
  onDateSelect,
  onClose,
  isVisible,
  triggerRef,
  highlightedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Debug: Log when component mounts/unmounts
  useEffect(() => {
    console.log('DatePicker mounted/updated, isVisible:', isVisible);
    return () => {
      console.log('DatePicker unmounting');
    };
  }, [isVisible]);

  // Sync internal state with selectedDate prop
  useEffect(() => {
    console.log('DatePicker selectedDate changed:', selectedDate);
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  // Calculate position based on trigger element
  useEffect(() => {
    if (isVisible && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // Position below the trigger element
        left: rect.left // Align with left edge of trigger
      });
    }
  }, [isVisible, triggerRef]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('ESC key pressed - closing DatePicker');
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  // Close on click outside - DISABLED for now to fix usability
  // useEffect(() => {
  //   const handleClickOutside = (e: MouseEvent) => {
  //     // Get the DatePicker element
  //     const datePickerElement = document.querySelector('[data-datepicker-container]');
      
  //     // Check if click is inside DatePicker or trigger
  //     const isInsideDatePicker = datePickerElement && datePickerElement.contains(e.target as Node);
  //     const isInsideTrigger = triggerRef?.current && triggerRef.current.contains(e.target as Node);
      
  //     // Only close if click is outside both
  //     if (!isInsideDatePicker && !isInsideTrigger) {
  //       onClose();
  //     }
  //   };

  //   if (isVisible) {
  //     // Use a small delay to prevent immediate closing
  //     const timeoutId = setTimeout(() => {
  //       document.addEventListener('mousedown', handleClickOutside);
  //     }, 100);
      
  //     return () => {
  //       clearTimeout(timeoutId);
  //       document.removeEventListener('mousedown', handleClickOutside);
  //     };
  //   }
  // }, [isVisible, onClose, triggerRef]);

  // Get date range from documents
  const dateRange = useMemo(() => {
    if (docs.length === 0) return { min: new Date(), max: new Date() };
    
    const dates = docs.map(doc => new Date(doc.date));
    return {
      min: new Date(Math.min(...dates.map(d => d.getTime()))),
      max: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }, [docs]);

  // Check if a date has documents
  const hasDocuments = useCallback((date: Date) => {
    return docs.some(doc => {
      const docDate = new Date(doc.date);
      return docDate.getFullYear() === date.getFullYear() &&
             docDate.getMonth() === date.getMonth() &&
             docDate.getDate() === date.getDate();
    });
  }, [docs]);

  // Check if navigation is allowed
  const canNavigateToMonth = (year: number, month: number) => {
    const targetDate = new Date(year, month, 1);
    return targetDate >= new Date(dateRange.min.getFullYear(), dateRange.min.getMonth(), 1) &&
           targetDate <= new Date(dateRange.max.getFullYear(), dateRange.max.getMonth(), 1);
  };

  // Check if a month has documents
  const monthHasDocuments = useCallback((year: number, month: number) => {
    return docs.some(doc => {
      const docDate = new Date(doc.date);
      return docDate.getFullYear() === year && docDate.getMonth() === month;
    });
  }, [docs]);

  // Get available years from documents
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(docs.map(doc => new Date(doc.date).getFullYear())))
      .sort((a, b) => a - b);
    return years;
  }, [docs]);

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    onDateSelect(date);
    onClose();
  };

  const handlePrevMonth = () => {
    console.log('Previous month clicked');
    let newYear = currentYear;
    let newMonth = currentMonth - 1;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    
    if (canNavigateToMonth(newYear, newMonth)) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    console.log('Next month clicked');
    let newYear = currentYear;
    let newMonth = currentMonth + 1;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    
    if (canNavigateToMonth(newYear, newMonth)) {
      setCurrentYear(newYear);
      setCurrentMonth(newMonth);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    if (canNavigateToMonth(newYear, currentMonth)) {
      setCurrentYear(newYear);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    if (canNavigateToMonth(currentYear, newMonth)) {
      setCurrentMonth(newMonth);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        hasDocuments: hasDocuments(date)
      });
    }
    
    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({
        date,
        isCurrentMonth: true,
        hasDocuments: hasDocuments(date)
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        hasDocuments: hasDocuments(date)
      });
    }
    
    return days;
  }, [currentYear, currentMonth, hasDocuments]);

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (!isVisible) return null;

  return createPortal(
    <DatePickerContainer top={position.top} left={position.left} data-datepicker-container>
      <DatePickerHeader>
        <DropdownContainer>
          <YearDropdown value={currentYear} onChange={handleYearChange}>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </YearDropdown>
          <MonthDropdown value={currentMonth} onChange={handleMonthChange}>
            {monthNames.map((month, index) => (
              <MonthOption 
                key={index} 
                value={index}
                hasDocuments={monthHasDocuments(currentYear, index)}
              >
                {month}
              </MonthOption>
            ))}
          </MonthDropdown>
        </DropdownContainer>
        <div style={{ display: 'flex', gap: '4px' }}>
          <NavigationButton 
            onClick={handlePrevMonth}
            disabled={!canNavigateToMonth(
              currentMonth === 0 ? currentYear - 1 : currentYear,
              currentMonth === 0 ? 11 : currentMonth - 1
            )}
          >
            ‹
          </NavigationButton>
          <NavigationButton 
            onClick={handleNextMonth}
            disabled={!canNavigateToMonth(
              currentMonth === 11 ? currentYear + 1 : currentYear,
              currentMonth === 11 ? 0 : currentMonth + 1
            )}
          >
            ›
          </NavigationButton>
        </div>
      </DatePickerHeader>
      
      <DayLabelsRow>
        {dayLabels.map(day => (
          <DayLabel key={day}>{day}</DayLabel>
        ))}
      </DayLabelsRow>
      
      <DateGrid>
        {calendarDays.map((dayData, index) => {
          const isSelected = selectedDate.getFullYear() === dayData.date.getFullYear() &&
                           selectedDate.getMonth() === dayData.date.getMonth() &&
                           selectedDate.getDate() === dayData.date.getDate();
          
          return (
            <DateButton
              key={index}
              isSelected={isSelected}
              isCurrentMonth={dayData.isCurrentMonth}
              hasDocuments={dayData.hasDocuments}
              onClick={() => handleDateClick(dayData.date)}
            >
              {dayData.date.getDate()}
            </DateButton>
          );
        })}
      </DateGrid>
    </DatePickerContainer>,
    document.body
  );
};

export default DatePicker;
