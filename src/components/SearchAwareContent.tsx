import React from 'react';
import styled from 'styled-components';
import CalendarArea from './CalendarArea';
import DocumentPreview from './DocumentPreview';
import { DataLoadingState } from './DataLoadingState';
import { EmptyState } from './EmptyState';
import { useSearch } from '../features/search/SearchCtx';
import { TimeScale, Mode, Doc, DocumentPreviewData, ViewMode } from '../types/Timeline';

const ContentRow = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 200px); /* Subtract top panel height */
  position: relative; /* Enable absolute positioning for preview panel */
`;

const CalendarWrapper = styled.div<{ isPreviewVisible: boolean }>`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-right: ${props => props.isPreviewVisible ? '620px' : '0'};
  transition: margin-right 0.3s ease;
`;

const DocumentPreviewPanel = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 121px; /* Start from bottom of TopPanel (TopPanel height is 121px) */
  right: 0;
  width: 620px;
  height: calc(100vh - 121px); /* Extend to bottom of viewport minus TopPanel height */
  background: white;
  border-left: 1px solid #e5e7eb;
  transform: ${props => props.isVisible ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease;
  z-index: 50005;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

interface SearchAwareContentProps {
  scale: TimeScale;
  mode: Mode;
  viewMode?: ViewMode;
  range: { start: Date; end: Date };
  docs: Doc[]; // Original docs array
  selectedDocId?: string;
  onSelect: (doc: Doc) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  highlightedMonth?: { year: number; month: number };
  highlightedDate?: Date | null;
  currentYear?: number;
  currentMonth?: number;
  currentDay?: number;
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  onDayChange?: (day: number) => void;
  onManualNavigationStart?: () => void;
  manualNavigationRef?: React.MutableRefObject<boolean>;
  scrollToDateRef?: React.MutableRefObject<((date: Date) => void) | null>;
  onHighlightedDate?: (date: Date | null) => void;
  isPreviewVisible: boolean;
  selectedDocument: DocumentPreviewData | null;
  onClosePreview: () => void;
  onScaleChange: (scale: TimeScale) => void;
  onModeChange: (mode: Mode) => void;
  onScrub: (date: Date) => void;
}

export function SearchAwareContent({
  scale,
  mode,
  viewMode = 'titles',
  range,
  docs,
  selectedDocId,
  onSelect,
  onNavigate,
  highlightedMonth,
  highlightedDate,
  currentYear,
  currentMonth,
  currentDay,
  onYearChange,
  onMonthChange,
  onDayChange,
  onManualNavigationStart,
  manualNavigationRef,
  scrollToDateRef,
  onHighlightedDate,
  isPreviewVisible,
  selectedDocument,
  onClosePreview,
  onScaleChange,
  onModeChange,
  onScrub
}: SearchAwareContentProps) {
  const { query, results, clearFilters } = useSearch();
  
  // Deselect and close preview if selected document is filtered out
  React.useEffect(() => {
    if (selectedDocId) {
      const isStillInResults = results.some(doc => doc.id === selectedDocId);
      if (!isStillInResults) {
        onClosePreview();
      }
    }
  }, [results, selectedDocId, onClosePreview]);
  
  // Show loading state if no docs are loaded yet
  if (docs.length === 0) {
    return (
      <ContentRow>
        <DataLoadingState />
        <DocumentPreviewPanel isVisible={false}>
          {/* Document preview is disabled in loading state */}
        </DocumentPreviewPanel>
      </ContentRow>
    );
  }
  
  // Show empty state if filters return no results
  if (results.length === 0) {
    return (
      <ContentRow>
        <EmptyState onClearFilters={clearFilters} />
        <DocumentPreviewPanel isVisible={false}>
          {/* Document preview is disabled in empty state */}
        </DocumentPreviewPanel>
      </ContentRow>
    );
  }
  
  // Show calendar view with filtered results
  return (
    <ContentRow>
      <CalendarWrapper isPreviewVisible={isPreviewVisible}>
        <CalendarArea
          scale={scale}
          mode={mode}
          viewMode={viewMode}
          range={range}
          docs={results}
          selectedDocId={selectedDocId}
          onScaleChange={onScaleChange}
          onModeChange={onModeChange}
          onScrub={onScrub}
          onSelect={onSelect}
          isPreviewVisible={isPreviewVisible}
          highlightedDate={highlightedDate}
          currentYear={currentYear}
          currentMonth={currentMonth}
          currentDay={currentDay}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onDayChange={onDayChange}
          onManualNavigationStart={onManualNavigationStart}
          manualNavigationRef={manualNavigationRef}
          scrollToDateRef={scrollToDateRef}
          onHighlightedDate={onHighlightedDate}
        />
      </CalendarWrapper>
      
      <DocumentPreviewPanel isVisible={isPreviewVisible}>
        <DocumentPreview
          key={`${selectedDocument?.id}-${query}`} // Force re-render when query changes
          document={selectedDocument}
          onClose={onClosePreview}
        />
      </DocumentPreviewPanel>
    </ContentRow>
  );
}

