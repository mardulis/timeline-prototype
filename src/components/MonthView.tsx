import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ViewProps, Doc } from '../types/Timeline';
import { useSearch } from '../features/search/SearchCtx';
import { highlightText } from '../features/search/highlight';

const MonthViewContainer = styled.div`
  flex: 1;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MonthGrid = styled.div`
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

const MonthColumns = styled.div`
  display: flex;
  min-width: max-content;
  height: 100%; /* Ensure columns can scroll individually */
`;

const MonthColumn = styled.div<{ isEmpty?: boolean; isFirst?: boolean; isLast?: boolean }>`
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

const MonthText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
`;

const YearText = styled.span`
  font-size: 13px;
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

const DocumentDate = styled.div`
  font-size: 11px;
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

const MonthView: React.FC<ViewProps> = ({ docs, selectedDocId, onSelect, highlightedMonth, highlightedDate, currentYear = 2021 }) => {
  const { query } = useSearch();
  // Group documents by month for the current year
  const monthGroups = useMemo(() => {
    const groups: { [month: string]: Doc[] } = {};
    
    docs.forEach(doc => {
      const docDate = new Date(doc.date);
      if (docDate.getFullYear() === currentYear) {
        const month = docDate.getMonth().toString();
        if (!groups[month]) {
          groups[month] = [];
        }
        groups[month].push(doc);
      }
    });

    // Create array of months with documents
    const monthArray = [];
    for (let month = 0; month < 12; month++) {
      const monthStr = month.toString();
      const monthDocs = groups[monthStr] ? 
        groups[monthStr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
      
      monthArray.push({
        month,
        monthName: new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' }),
        docs: monthDocs
      });
    }
    
    return monthArray;
  }, [docs, currentYear]);

  const handleDocSelect = (doc: Doc) => {
    onSelect(doc);
  };

  return (
    <MonthViewContainer>
      <MonthGrid className="scrollable-grid">
        <MonthColumns>
          {monthGroups.map((monthGroup, index) => {
            const isFirst = index === 0;
            const isLast = index === monthGroups.length - 1;
            return (
              <MonthColumn key={monthGroup.month} data-month={monthGroup.month} isEmpty={monthGroup.docs.length === 0} isFirst={isFirst} isLast={isLast}>
                <ColumnHeader 
                  isFirst={isFirst} 
                  isLast={isLast}
                  isHighlighted={!!(highlightedDate && 
                    highlightedDate.getFullYear() === currentYear && 
                    highlightedDate.getMonth() === monthGroup.month)}
                >
                  <MonthText>{monthGroup.monthName}</MonthText> <YearText>{currentYear}</YearText>
                </ColumnHeader>
              
              <DocumentList className="scroll-fade" isFirst={isFirst} isLast={isLast}>
                <div className="scroll-inner">
                  {monthGroup.docs.length === 0 ? (
                    <EmptyState>No documents</EmptyState>
                  ) : (
                    monthGroup.docs.map((doc, docIndex) => (
                      <DocumentItem
                        key={doc.id}
                        isSelected={selectedDocId === doc.id}
                        isHighlighted={highlightedMonth?.year === currentYear && highlightedMonth?.month === monthGroup.month}
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
                          isHighlighted={highlightedMonth?.year === currentYear && highlightedMonth?.month === monthGroup.month}
                        >
                          <DocumentIcon isSelected={selectedDocId === doc.id}>
                            <img src="/svg/Document.svg" alt="Document" width="16" height="16" />
                          </DocumentIcon>
                        
                          <DocumentInfo>
                            <DocumentTitle>{highlightText(doc.title, query)}</DocumentTitle>
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
                    ))
                  )}
                </div>
              </DocumentList>
            </MonthColumn>
            );
          })}
          <EmptyColumn />
        </MonthColumns>
      </MonthGrid>
    </MonthViewContainer>
  );
};

export default MonthView;
