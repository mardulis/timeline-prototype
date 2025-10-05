import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import LeftSidebar from './LeftSidebar';
import TopPanel from './TopPanel';
import SearchAndControls from './SearchAndControls';
import CalendarArea from './CalendarArea';
import DocumentPreview from './DocumentPreview';
import { TimeScale, Mode, Doc, DocumentPreviewData } from '../types/Timeline';
import { loadCSVDocuments } from '../utils/csvParser';

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
  z-index: 10;
  background: white;
  overflow: hidden; /* Prevent horizontal scrolling in top section */
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
  z-index: 35; /* Above column headers (z-index: 30) and minimap (z-index: 20) */
  transform: ${props => props.isVisible ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 300ms ease-in-out;
`;

// Convert Doc to DocumentPreviewData
const convertDocToPreviewData = (doc: Doc): DocumentPreviewData => {
  return {
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
  const [range, setRange] = useState({ start: new Date(2018, 0, 1), end: new Date(2025, 11, 31) });
  const [docs, setDocs] = useState<Doc[]>([]);
  const manualNavigationRef = useRef(false);

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

  return (
    <DashboardContainer>
      <LeftSidebar />
      
      <MainContentArea>
        <TopSection>
          <TopPanel mode={mode} onModeChange={handleModeChange} />
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
          />
        </TopSection>
        
        <ContentRow>
          <CalendarWrapper>
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
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          onDayChange={handleDayChange}
          onManualNavigationStart={handleManualNavigationStart}
          manualNavigationRef={manualNavigationRef}
        />
          </CalendarWrapper>
          
          <DocumentPreviewPanel isVisible={!!selectedDoc}>
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
