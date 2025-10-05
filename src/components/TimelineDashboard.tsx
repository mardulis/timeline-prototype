import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import LeftSidebar from './LeftSidebar';
import TopPanel from './TopPanel';
import SearchAndControls from './SearchAndControls';
import CalendarArea from './CalendarArea';
import DocumentPreview from './DocumentPreview';
import CSVErrorState from './CSVErrorState';
import CSVLoadingState from './CSVLoadingState';
import { TimeScale, Mode, Doc, DocumentPreviewData } from '../types/Timeline';
import { loadCSVDocuments, loadTestCSVDocuments, parseCSV } from '../utils/csvParser';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f9fafb;
  overflow: hidden; /* Prevent page-level horizontal scrolling */
`;

const MainContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  height: 100vh;
  overflow: hidden; /* Prevent page-level horizontal scrolling */
`;

const TopSection = styled.div`
  position: sticky;
  top: 0;
  z-index: 50004; /* Higher z-index to ensure date picker is above all elements */
  background: white;
  overflow: visible; /* Allow date picker to be visible */
`;

const ContentRow = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 200px); /* Subtract top panel height */
  position: relative; /* Enable absolute positioning for preview panel */
`;

const CalendarWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
`;

const DocumentPreviewPanel = styled.div<{ isVisible: boolean }>`
  width: 620px;
  background: white;
  border-left: 1px solid #e5e7eb;
  border-top: 1px solid #e5e7eb; /* Top border at 120px from top */
  height: calc(100vh - 120px); /* Height from 120px to bottom */
  overflow-y: auto;
  position: fixed;
  top: 120px; /* Position top border at 120px from top of page */
  right: 0;
  z-index: 50005; /* Above everything including top panel and date picker */
  transform: ${props => props.isVisible ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 300ms ease-in-out;
`;

// Convert Doc to DocumentPreviewData
const convertDocToPreviewData = (doc: Doc): DocumentPreviewData => {
  return {
    id: doc.id,
    title: doc.title,
    date: doc.date,
    docType: doc.docType,
    author: doc.author,
    facility: doc.facility,
    pages: doc.pages,
    summary: doc.summary,
    medications: doc.medications || [],
    diagnoses: doc.diagnoses || [],
    labs: doc.labs || []
  };
};

const TimelineDashboard: React.FC = () => {
  const [scale, setScale] = useState<TimeScale>('year');
  const [mode, setMode] = useState<Mode>('all');
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [currentYear, setCurrentYear] = useState(2021);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [highlightedDate, setHighlightedDate] = useState<Date | null>(null);
  const [range, setRange] = useState({ start: new Date(2018, 0, 1), end: new Date(2025, 11, 31) });
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const manualNavigationRef = useRef(false);
  const scrollToDateRef = useRef<((date: Date) => void) | null>(null);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const csvDocs = await loadCSVDocuments();
        setDocs(csvDocs);
        
        // Update range based on actual data
        if (csvDocs.length > 0) {
          const dates = csvDocs.map(doc => new Date(doc.date));
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          setRange({ start: minDate, end: maxDate });
          
          // Set current year to the most recent year with data
          const maxYear = maxDate.getFullYear();
          setCurrentYear(maxYear);
        }
      } catch (error) {
        console.error('Failed to load CSV data:', error);
        // Fallback to empty array
        setDocs([]);
      }
    };

    loadData();
  }, []);

  const previewData = useMemo(() => 
    selectedDoc ? convertDocToPreviewData(selectedDoc) : null, 
    [selectedDoc]
  );

  const handleLoadCSV = async (file: File) => {
    setIsLoadingCSV(true);
    setCsvError(null);
    setSelectedDoc(null); // Close document preview panel
    
    try {
      const text = await file.text();
      const csvDocs = parseCSV(text);
      
      if (csvDocs.length === 0) {
        throw new Error('No valid data found in CSV file');
      }
      
      setDocs(csvDocs);
      
      // Switch to Year timeframe when CSV is loaded
      setScale('year');
      
      // Update range based on actual data
      const dates = csvDocs.map(doc => new Date(doc.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      setRange({ start: minDate, end: maxDate });
      
      // Set current year to the most recent year with data
      const maxYear = maxDate.getFullYear();
      setCurrentYear(maxYear);
      
      // Clear any selected document
      setSelectedDoc(null);
      
    } catch (error) {
      console.error('Failed to load CSV:', error);
      setCsvError(error instanceof Error ? error.message : 'Failed to load CSV file');
    } finally {
      setIsLoadingCSV(false);
    }
  };

  const handleRefreshCSV = () => {
    setCsvError(null);
    setSelectedDoc(null); // Close document preview panel
    // Trigger file picker to load a new CSV file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleLoadCSV(file);
      }
    };
    fileInput.click();
  };

  const handleLoadDefaultCSV = async () => {
    setIsLoadingCSV(true);
    setCsvError(null);
    setSelectedDoc(null); // Close document preview panel
    
    try {
      const csvDocs = await loadTestCSVDocuments();
      
      if (csvDocs.length === 0) {
        throw new Error('No valid data found in Test.csv file');
      }
      
      setDocs(csvDocs);
      
      // Switch to Year timeframe when CSV is loaded
      setScale('year');
      
      // Update range based on actual data
      if (csvDocs.length > 0) {
        const dates = csvDocs.map(doc => new Date(doc.date));
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        setRange({ start: minDate, end: maxDate });
        
        // Set current year to the most recent year with data
        const maxYear = maxDate.getFullYear();
        setCurrentYear(maxYear);
      }
    } catch (error) {
      console.error('Error loading Test.csv:', error);
      setCsvError(error instanceof Error ? error.message : 'Failed to load Test.csv');
    } finally {
      setIsLoadingCSV(false);
    }
  };

  const handleScaleChange = (newScale: TimeScale) => {
    setScale(newScale);
    
    // Preserve current date context when switching views
    // Update range based on current year/month/day state
    if (newScale === 'year') {
      // Year view: show full year range
      setRange({
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 11, 31)
      });
    } else if (newScale === 'month') {
      // Month view: show the current year
      setRange({
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 11, 31)
      });
    } else if (newScale === 'day') {
      // Day view: show the current month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      setRange({
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth, daysInMonth)
      });
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handleScrub = (date: Date) => {
    // Update range based on scrubber position and current scale
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (scale === 'year') {
      setRange({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31)
      });
    } else if (scale === 'month') {
      setRange({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31)
      });
    } else if (scale === 'day') {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      setRange({
        start: new Date(year, month, 1),
        end: new Date(year, month, daysInMonth)
      });
    }
  };

  const handleDocSelect = (doc: Doc) => {
    setSelectedDoc(doc);
  };

  const handleClosePreview = () => {
    setSelectedDoc(null);
  };

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
  };

  const handleDayChange = (day: number) => {
    setCurrentDay(day);
  };

  const handleManualNavigationStart = () => {
    manualNavigationRef.current = true;
    // Clear selected document when user starts manual navigation
    setSelectedDoc(null);
    // Reset the flag after a shorter delay for faster response
    setTimeout(() => {
      manualNavigationRef.current = false;
    }, 100);
  };

  const handleHighlightedDate = (date: Date | null) => {
    setHighlightedDate(date);
  };

  return (
    <DashboardContainer>
      <LeftSidebar />
      
      <MainContentArea>
        <TopSection>
          <TopPanel mode={mode} onModeChange={handleModeChange} onLoadCSV={handleLoadCSV} />
          <SearchAndControls
            scale={scale}
            onScaleChange={handleScaleChange}
            onScrub={handleScrub}
            range={range}
            docs={docs}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            onDayChange={handleDayChange}
            currentYear={currentYear}
            currentMonth={currentMonth}
            currentDay={currentDay}
            onManualNavigationStart={handleManualNavigationStart}
            onHighlightedDate={handleHighlightedDate}
            scrollToDateRef={scrollToDateRef}
          />
        </TopSection>
        
        <ContentRow>
          <CalendarWrapper>
            {isLoadingCSV ? (
              <CSVLoadingState />
            ) : csvError ? (
              <CSVErrorState error={csvError} onRefresh={handleRefreshCSV} onLoadDefault={handleLoadDefaultCSV} />
            ) : (
              <CalendarArea
                scale={scale}
                mode={mode}
                range={range}
                docs={docs}
                selectedDocId={selectedDoc?.id}
                onScaleChange={handleScaleChange}
                onModeChange={handleModeChange}
                onScrub={handleScrub}
                onSelect={handleDocSelect}
                isPreviewVisible={!!selectedDoc}
                currentYear={currentYear}
                currentMonth={currentMonth}
                currentDay={currentDay}
                highlightedDate={highlightedDate}
                onYearChange={handleYearChange}
                onMonthChange={handleMonthChange}
                onDayChange={handleDayChange}
                onManualNavigationStart={handleManualNavigationStart}
                manualNavigationRef={manualNavigationRef}
                scrollToDateRef={scrollToDateRef}
                onHighlightedDate={handleHighlightedDate}
              />
            )}
          </CalendarWrapper>
          
          <DocumentPreviewPanel isVisible={!!selectedDoc} data-preview-panel>
            <DocumentPreview
              document={previewData}
              onClose={handleClosePreview}
            />
          </DocumentPreviewPanel>
        </ContentRow>
      </MainContentArea>
    </DashboardContainer>
  );
};

export default TimelineDashboard;
