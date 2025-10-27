import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ViewProps, Doc, ChildEntityItem } from '../types/Timeline';
import { useSearch } from '../features/search/SearchCtx';
import { highlightText } from '../features/search/highlight';
import { expandDocumentsToChildEntities, getViewModeIcon, getViewModeIconAlt } from '../utils/viewModeHelpers';

const DayViewContainer = styled.div`
  flex: 1;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DayGrid = styled.div`
  flex: 1;
  overflow-x: auto; /* Enable horizontal scrolling */
  overflow-y: auto; /* Allow vertical scrolling for columns */
  padding: 6px 24px 16px 24px; /* 6px top, 24px left/right, 16px bottom */
  scroll-behavior: auto; /* Precise positioning for programmatic scrolling */
  display: flex;
  border-radius: 8px;
  background-color: #fff;
  
  /* Smooth transitions for manual scrolling */
  transition: scroll-behavior 0.2s ease-out;
  
  /* Custom horizontal scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px; /* Height for horizontal scrollbar */
  }
  
  &::-webkit-scrollbar-track {
    background: transparent; /* Light track background */
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb; /* Light gray thumb */
    border-radius: 4px;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background: #d1d5db; /* Slightly darker on hover */
  }
`;

const DayColumns = styled.div`
  display: flex;
  min-width: max-content;
  height: 100%; /* Ensure columns can scroll individually */
`;

const DayColumn = styled.div<{ isEmpty?: boolean; isFirst?: boolean; isLast?: boolean }>`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e5e7eb; /* Bottom border for calendar table */
  border-radius: ${props => {
    if (props.isFirst && props.isLast) return '0 0 8px 8px'; // Both first and last - bottom left and right radius
    if (props.isFirst) return '0 0 0 8px'; // Left bottom radius for first column
    if (props.isLast) return '0 0 8px 0'; // Right bottom radius for last column
    return '0';
  }};
  border-left: ${props => {
    if (props.isFirst && props.isLast) return '1px solid #e5e7eb'; /* Solid left border for single column */
    return 'none'; /* No left border for columns - header handles it */
  }};
  border-right: ${props => {
    if (props.isFirst && props.isLast) return '1px solid #e5e7eb'; /* Solid right border for single column */
    return 'none'; /* No right border for columns - header handles it */
  }};
  padding: 0; /* Remove padding from column container */
  min-width: ${props => props.isEmpty ? '160px' : '200px'};
  width: ${props => props.isEmpty ? '160px' : '300px'};
  flex-shrink: 0;
  height: 100%;
`;

const ColumnHeader = styled.div<{ isFirst?: boolean; isLast?: boolean; isHighlighted?: boolean }>`
  background: ${props => props.isHighlighted ? '#fef3c7' : '#f8fafc'};
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
  padding: 12px 16px;
  border-radius: ${props => {
    if (props.isFirst && props.isLast) return '8px 8px 0 0'; // Both first and last - top left and right radius
    if (props.isFirst) return '8px 0 0 0'; // Top left radius for first column
    if (props.isLast) return '0 8px 0 0'; // Top right radius for last column
    return '0';
  }};
  text-align: left;
  border-left: ${props => {
    if (props.isFirst && props.isLast) return '1px solid #e5e7eb'; /* Solid left border for single column */
    if (props.isFirst) return '1px solid #e5e7eb'; /* Solid left border for first column */
    return '1px solid #e5e7eb'; /* Solid left border for all other columns (including last) */
  }};
  border-right: ${props => {
    if (props.isFirst && props.isLast) return '1px solid #e5e7eb'; /* Solid right border for single column */
    if (props.isFirst) return 'none'; /* No right border for first column */
    if (props.isLast) return '1px solid #e5e7eb'; /* Solid right border for last column */
    return 'none'; /* No right border for middle columns */
  }};
  border-top: ${props => '1px solid #e5e7eb'}; /* Standard top border */
  border-bottom: ${props => '1px solid #e5e7eb'}; /* Standard bottom border */
  position: sticky;
  top: 0;
  z-index: 30; /* Higher than minimap (z-index: 20) */
  transition: all 0.3s ease;
`;

const DayName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const DayNumber = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const DocumentList = styled.div<{ isFirst?: boolean; isLast?: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 0; /* Remove padding so documents span full width */
  padding-top: 0; /* No top padding since header has bottom border */
  scroll-behavior: smooth;
  border-left: ${props => {
    if (props.isFirst) return '1px solid #e5e7eb'; /* Solid left border for first column content area */
    if (props.isLast) return '1px dashed #e5e7eb'; /* Dashed left border for last column content area */
    return '1px dashed #e5e7eb'; /* Dashed left border for middle columns */
  }};
  border-right: ${props => props.isLast ? '1px solid #e5e7eb' : 'none'}; /* Solid right border for last column content area */
  border-radius: ${props => {
    if (props.isFirst && props.isLast) return '0 0 8px 8px'; // Both first and last
    if (props.isFirst) return '0 0 0 8px'; // Left bottom radius for first column
    if (props.isLast) return '0 0 8px 0'; // Right bottom radius for last column
    return '0';
  }};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background: #9ca3af;
  }
`;

const DocumentItem = styled.div<{ isSelected: boolean; isHighlighted?: boolean; isFirst?: boolean }>`
  padding: ${props => props.isFirst ? '12px 8px 2px 8px' : '2px 8px'}; /* 12px top padding for first item, 2px for others */
  margin-bottom: 2px;
`;

const DocumentItemContent = styled.div<{ isSelected: boolean; isHighlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px; /* Changed from 4px to 8px for proper internal spacing */
  border-radius: 8px;
  cursor: ${props => props.isSelected ? 'default' : 'pointer'};
  transition: background-color 0.2s ease, color 0.2s ease;
  color: ${props => props.isSelected ? '#1a73e8' : '#1a1a1a'};
  background-color: ${props => props.isSelected ? '#eaf2ff' : 'transparent'};
  font-weight: ${props => props.isSelected ? '500' : '400'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#eaf2ff' : '#f5f7fa'};
    cursor: pointer;
  }
`;

const DocumentIcon = styled.div<{ isSelected: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentTitle = styled.div`
  font-size: 13px;
  font-weight: inherit;
  color: inherit;
  margin-bottom: 2px;
  line-height: 1.3;
`;

const DocumentTime = styled.div`
  font-size: 10px;
  color: inherit;
  opacity: 0.7;
`;

const EmptyState = styled.div`
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
  padding: 12px 0 0 12px; /* 12px top and left padding */
`;

const EmptyColumn = styled.div`
  min-width: 620px;
  width: 620px;
  flex-shrink: 0;
  background: transparent;
`;

const DayView: React.FC<ViewProps> = ({ docs, viewMode = 'titles', selectedDocId, onSelect, highlightedMonth, highlightedDate, currentYear = 2021, currentMonth = 0 }) => {
  const { query } = useSearch();
  
  // Expand documents into child entities based on viewMode
  const items = useMemo(() => 
    expandDocumentsToChildEntities(docs, viewMode),
    [docs, viewMode]
  );
  
  // Group items (docs or child entities) by day for the current month
  const dayGroups = useMemo(() => {
    const groups: { [day: string]: (Doc | ChildEntityItem)[] } = {};
    
    items.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
        const day = itemDate.getDate().toString();
        if (!groups[day]) {
          groups[day] = [];
        }
        groups[day].push(item);
      }
    });

    // Create array of days with documents
    const dayArray = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString();
      const dayDocs = groups[dayStr] ? 
        groups[dayStr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
      
      dayArray.push({
        day,
        dayName: new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { weekday: 'long' }),
        docs: dayDocs
      });
    }
    
    return dayArray;
  }, [items, currentYear, currentMonth]);

  const handleItemSelect = (item: Doc | ChildEntityItem) => {
    // If it's a child entity, select the parent document but pass the child entity ID for highlighting
    if ('parentDoc' in item) {
      onSelect(item.parentDoc, item.id);
    } else {
      onSelect(item, item.id);
    }
  };
  
  const getItemId = (item: Doc | ChildEntityItem): string => {
    return item.id;
  };
  
  const getItemDisplayName = (item: Doc | ChildEntityItem): string => {
    if ('entityName' in item) {
      return item.entityName;
    }
    return item.title;
  };
  
  const isItemSelected = (item: Doc | ChildEntityItem): boolean => {
    // Check if this specific item is selected (not siblings)
    return item.id === selectedDocId;
  };

  return (
    <DayViewContainer>
      <DayGrid className="scrollable-grid">
        <DayColumns>
          {dayGroups.map((dayGroup, index) => {
            const isFirst = index === 0;
            const isLast = index === dayGroups.length - 1;
            return (
              <DayColumn key={dayGroup.day} data-day={dayGroup.day} isEmpty={dayGroup.docs.length === 0} isFirst={isFirst} isLast={isLast}>
                <ColumnHeader 
                  isFirst={isFirst} 
                  isLast={isLast}
                  isHighlighted={!!(highlightedDate && 
                    highlightedDate.getFullYear() === currentYear && 
                    highlightedDate.getMonth() === currentMonth && 
                    highlightedDate.getDate() === dayGroup.day)}
                >
                  <DayName>{dayGroup.dayName}</DayName> <DayNumber>{dayGroup.day}</DayNumber>
                </ColumnHeader>
              
              <DocumentList className="scroll-fade" isFirst={isFirst} isLast={isLast}>
                <div className="scroll-inner">
                  {dayGroup.docs.length === 0 ? (
                    <EmptyState>No documents</EmptyState>
                  ) : (
                    dayGroup.docs.map((item, itemIndex) => {
                      const itemId = getItemId(item);
                      const isSelected = isItemSelected(item);
                      
                      return (
                        <DocumentItem
                          key={itemId}
                          isSelected={isSelected}
                          isHighlighted={highlightedMonth?.year === currentYear && highlightedMonth?.month === currentMonth}
                          isFirst={itemIndex === 0}
                          onClick={() => handleItemSelect(item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleItemSelect(item);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                          data-doc-id={itemId}
                        >
                          <DocumentItemContent
                            isSelected={isSelected}
                            isHighlighted={highlightedMonth?.year === currentYear && highlightedMonth?.month === currentMonth}
                          >
                            <DocumentIcon isSelected={isSelected}>
                              <img src={getViewModeIcon(viewMode)} alt={getViewModeIconAlt(viewMode)} width="16" height="16" />
                            </DocumentIcon>
                          
                            <DocumentInfo>
                              <DocumentTitle>
                                {highlightText(getItemDisplayName(item), query)}
                              </DocumentTitle>
                              <DocumentTime>
                                {new Date(item.date).toLocaleTimeString('en-US', { 
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </DocumentTime>
                            </DocumentInfo>
                          </DocumentItemContent>
                        </DocumentItem>
                      );
                    })
                  )}
                </div>
              </DocumentList>
            </DayColumn>
            );
          })}
          <EmptyColumn />
        </DayColumns>
      </DayGrid>
    </DayViewContainer>
  );
};

export default DayView;
