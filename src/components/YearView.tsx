import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ViewProps, Doc } from '../types/Timeline';

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
  padding: 16px 24px;
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
  border-right: ${props => props.isLast ? '1px solid #e5e7eb' : '1px dashed #e5e7eb'}; /* Solid right border for last column, dashed for others */
  border-bottom: 1px solid #e5e7eb; /* Bottom border for calendar table */
  border-left: ${props => props.isFirst ? '1px solid #e5e7eb' : 'none'}; /* Solid left border for first column */
  border-radius: ${props => {
    if (props.isFirst && props.isLast) return '0 0 8px 8px'; // Both first and last
    if (props.isFirst) return '0 0 0 8px'; // Left bottom radius for first column
    if (props.isLast) return '0 0 8px 0'; // Right bottom radius for last column
    return '0';
  }};
  padding: 0; /* Remove padding from column container */
  min-width: ${props => props.isEmpty ? '160px' : '200px'};
  width: ${props => props.isEmpty ? '160px' : '300px'};
  flex-shrink: 0;
  height: 100%;
`;

const ColumnHeader = styled.div<{ isFirst?: boolean; isLast?: boolean }>`
  background: #f8fafc;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
  padding: 12px 16px;
  border-radius: ${props => props.isFirst ? '8px 0 0 0' : props.isLast ? '0 8px 0 0' : '0'};
  text-align: left;
  border-left: ${props => props.isFirst ? '1px solid #e5e7eb' : 'none'};
  border-right: 1px solid #e5e7eb;
  border-top: 1px solid #e5e7eb; /* Add top border */
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 30; /* Higher than minimap (z-index: 20) */
`;

const YearText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
`;

const DocumentList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0; /* Remove padding so documents span full width */
  padding-top: 0; /* No top padding since header has bottom border */
  scroll-behavior: smooth;
  
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
  border-radius: 4px;
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

const YearView: React.FC<ViewProps> = ({ docs, selectedDocId, onSelect, highlightedMonth }) => {
  // Group documents by year and then by month for all years in the dataset
  const yearGroups = useMemo(() => {
    const groups: { [year: string]: { [month: string]: Doc[] } } = {};
    
    docs.forEach(doc => {
      const docDate = new Date(doc.date);
      const year = docDate.getFullYear().toString();
      const month = docDate.getMonth().toString();
      
      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(doc);
    });

    // Ensure we show all years from 2018-2025, even if they have no documents
    const allYears = [];
    for (let year = 2018; year <= 2025; year++) {
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
  }, [docs]);

  const handleDocSelect = (doc: Doc) => {
    onSelect(doc);
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
              <ColumnHeader isFirst={isFirst} isLast={isLast}>
                <YearText>{yearGroup.year}</YearText>
              </ColumnHeader>
              
              <DocumentList>
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
                      {monthGroup.docs.map((doc, docIndex) => (
                        <DocumentItem
                          key={doc.id}
                          isSelected={selectedDocId === doc.id}
                          isHighlighted={highlightedMonth?.year === yearGroup.year && highlightedMonth?.month === monthGroup.month}
                          isFirst={docIndex === 0}
                          onClick={() => handleDocSelect(doc)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleDocSelect(doc);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-pressed={selectedDocId === doc.id}
                          data-doc-id={doc.id}
                        >
                          <DocumentItemContent
                            isSelected={selectedDocId === doc.id}
                            isHighlighted={highlightedMonth?.year === yearGroup.year && highlightedMonth?.month === monthGroup.month}
                          >
                            <DocumentIcon isSelected={selectedDocId === doc.id}>
                              <img src="/Document.svg" alt="Document" width="16" height="16" />
                            </DocumentIcon>
                            
                            <DocumentInfo>
                              <DocumentTitle>{doc.title}</DocumentTitle>
                              <DocumentDate>
                                {new Date(doc.date).toLocaleDateString('en-US', { 
                                  year: 'numeric',
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </DocumentDate>
                            </DocumentInfo>
                          </DocumentItemContent>
                        </DocumentItem>
                      ))}
                    </MonthGroup>
                  ))
                )}
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
