import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { Doc } from '../types/Timeline';

const DatePickerContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 16px;
  z-index: 9999;
  min-width: 280px;
`;

const DatePickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthYearDisplay = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
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
  background: ${props => props.isSelected ? '#3b82f6' : 'transparent'};
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => {
    if (props.isSelected) return 'white';
    if (!props.isCurrentMonth) return '#9ca3af';
    if (props.hasDocuments) return '#1f2937'; // Primary color for dates with documents
    return '#6b7280'; // Secondary color for dates without documents
  }};
  
  &:hover {
    background: ${props => props.isSelected ? '#3b82f6' : '#f3f4f6'};
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
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  docs,
  onDateSelect,
  onClose,
  isVisible
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

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

  const handlePrevMonth = () => {
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

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
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

  return (
    <DatePickerContainer>
      <DatePickerHeader>
        <MonthYearDisplay>
          {monthNames[currentMonth]} {currentYear}
        </MonthYearDisplay>
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
    </DatePickerContainer>
  );
};

export default DatePicker;
