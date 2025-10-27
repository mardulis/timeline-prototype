import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ViewProps, Doc, ChildEntityItem } from '../types/Timeline';
import { useSearch } from '../features/search/SearchCtx';
import { highlightText } from '../features/search/highlight';
import { expandDocumentsToChildEntities, getViewModeIcon, getViewModeIconAlt } from '../utils/viewModeHelpers';

const YearViewContainer = styled.div`
  flex: 1;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const YearGrid = styled.div`
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

const YearColumns = styled.div`
  display: flex;
  min-width: max-content;
  height: 100%; /* Ensure columns can scroll individually */
`;

const YearColumn = styled.div<{ isEmpty?: boolean; isFirst?: boolean; isLast?: boolean }>`
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

const YearText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
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

const DocumentDate = styled.div`
  font-size: 11px;
  color: inherit;
  opacity: 0.7;
`;

const MonthGroup = styled.div`
  margin-bottom: 12px;
`;

const MonthHeader = styled.div<{ isHighlighted?: boolean }>`
  background: ${props => props.isHighlighted ? '#fff3cd' : '#f8fafc'};
  padding: 12px 0 12px 12px; /* 12px top padding, 12px left padding for month name */
  height: 24px; /* Fixed height of 24px */
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.isHighlighted ? '#856404' : '#6b7280'};
  margin-bottom: 4px;
  border-left: ${props => props.isHighlighted ? '3px solid #ffc107' : '3px solid transparent'};
  display: flex;
  align-items: center;
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

const YearView: React.FC<ViewProps> = ({ docs, viewMode = 'titles', selectedDocId, onSelect, highlightedMonth, highlightedDate }) => {
  const { query } = useSearch();
  
  // Expand documents into child entities based on viewMode
  const items = useMemo(() => 
    expandDocumentsToChildEntities(docs, viewMode),
    [docs, viewMode]
  );
  
  // Group items (docs or child entities) by year and then by month for all years in the dataset
  const yearGroups = useMemo(() => {
    const groups: { [year: string]: { [month: string]: (Doc | ChildEntityItem)[] } } = {};
    
    items.forEach(item => {
      const itemDate = new Date(item.date);
      const year = itemDate.getFullYear().toString();
      const month = itemDate.getMonth().toString();
      
      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(item);
    });

    // Use fixed year range like the minimap (2018-2025)
    const minYear = 2018;
    const maxYear = 2025;
    
    // Ensure we show all years in the actual range, even if they have no documents
    const allYears = [];
    for (let year = minYear; year <= maxYear; year++) {
      const yearStr = year.toString();
      const yearData = groups[yearStr] || {};
      
      // Ensure we show all months for each year
      const monthGroups = [];
      for (let month = 0; month < 12; month++) {
        const monthStr = month.toString();
        const monthDocs = yearData[monthStr] ? 
          yearData[monthStr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
        
        monthGroups.push({
          month,
          monthName: new Date(year, month).toLocaleDateString('en-US', { month: 'short' }),
          docs: monthDocs
        });
      }
      
      allYears.push({
        year,
        monthGroups
      });
    }
    
    return allYears;
  }, [items]);

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
    <YearViewContainer>
      <YearGrid className="scrollable-grid">
        <YearColumns>
          {yearGroups.map((yearGroup, index) => {
            const isEmpty = yearGroup.monthGroups.every(monthGroup => monthGroup.docs.length === 0);
            const isFirst = index === 0;
            const isLast = index === yearGroups.length - 1;
            return (
              <YearColumn key={yearGroup.year} data-year={yearGroup.year} isEmpty={isEmpty} isFirst={isFirst} isLast={isLast}>
              <ColumnHeader 
                isFirst={isFirst} 
                isLast={isLast}
                isHighlighted={!!(highlightedDate && 
                  highlightedDate.getFullYear() === yearGroup.year)}
              >
                <YearText>{yearGroup.year}</YearText>
              </ColumnHeader>
              
              <DocumentList className="scroll-fade" isFirst={isFirst} isLast={isLast}>
                <div className="scroll-inner">
                  {yearGroup.monthGroups.every(monthGroup => monthGroup.docs.length === 0) ? (
                    <EmptyState>No documents</EmptyState>
                  ) : (
                    yearGroup.monthGroups
                      .filter(monthGroup => monthGroup.docs.length > 0) // Only show months with documents
                      .map(monthGroup => (
                      <MonthGroup key={monthGroup.month}>
                        <MonthHeader 
                          isHighlighted={highlightedMonth?.year === yearGroup.year && highlightedMonth?.month === monthGroup.month}
                          data-month={monthGroup.month}
                        >
                          {monthGroup.monthName}
                        </MonthHeader>
                        {monthGroup.docs.map((item, itemIndex) => {
                          const itemId = getItemId(item);
                          const isSelected = isItemSelected(item);
                          
                          return (
                            <DocumentItem
                              key={itemId}
                              isSelected={isSelected}
                              isHighlighted={highlightedMonth?.year === yearGroup.year && highlightedMonth?.month === monthGroup.month}
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
                                isHighlighted={highlightedMonth?.year === yearGroup.year && highlightedMonth?.month === monthGroup.month}
                              >
                                <DocumentIcon isSelected={isSelected}>
                                  <img src={getViewModeIcon(viewMode)} alt={getViewModeIconAlt(viewMode)} width="16" height="16" />
                                </DocumentIcon>
                                
                                <DocumentInfo>
                                  <DocumentTitle>
                                    {highlightText(getItemDisplayName(item), query)}
                                  </DocumentTitle>
                                  <DocumentDate>
                                    {new Date(item.date).toLocaleDateString('en-US', { 
                                      year: 'numeric',
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </DocumentDate>
                                </DocumentInfo>
                              </DocumentItemContent>
                            </DocumentItem>
                          );
                        })}
                      </MonthGroup>
                    ))
                  )}
                </div>
              </DocumentList>
            </YearColumn>
            );
          })}
          <EmptyColumn />
        </YearColumns>
      </YearGrid>
    </YearViewContainer>
  );
};

export default YearView;
