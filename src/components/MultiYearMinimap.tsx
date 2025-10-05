import React, { useMemo, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Doc } from '../types/Timeline';

// Minimap label computation constants
const LABEL_MIN_PX = 30; // Reduced from 50 to allow more labels when space is available
const LABEL_GAP_PX = 6; // Reduced from 12 to allow more labels when space is available

// Helper function to compute "nice" step values
function niceStep(n: number): number {
  if (n <= 1) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const cands = [1, 2, 5].map(m => m * pow);
  for (const c of cands) if (c >= n) return c;
  return 10 * pow;
}

// Main function to compute year labels with collision detection
function computeYearLabels({
  y0, y1, widthPx, yearToX, measureText,
  labelMinPx = LABEL_MIN_PX, labelGapPx = LABEL_GAP_PX
}: {
  y0: number;
  y1: number;
  widthPx: number;
  yearToX: (y: number) => number;
  measureText: (s: string) => number;
  labelMinPx?: number;
  labelGapPx?: number;
}): number[] {
  const totalYears = Math.max(1, (y1 - y0 + 1));
  const pxPerYear = widthPx / totalYears;
  
  // First, try to fit all years with minimum spacing
  const allYears = [];
  for (let year = y0; year <= y1; year++) {
    allYears.push(year);
  }
  
  // Check if all years fit with proper spacing
  let lastRight = -Infinity;
  const allFit = allYears.every(year => {
    const x = yearToX(year);
    const w = measureText(String(year));
    if (x >= lastRight + labelGapPx) {
      lastRight = x + w;
      return true;
    }
    return false;
  });
  
  // If all years fit, return them all
  if (allFit) {
    return allYears;
  }
  
  // Otherwise, use the step-based algorithm for tight spacing
  const rawStepYears = Math.max(1, Math.ceil(labelMinPx / Math.max(1e-6, pxPerYear)));
  const step = niceStep(rawStepYears);

  const start = Math.ceil(y0 / step) * step;
  const candidates = new Set<number>();
  for (let y = start; y <= y1; y += step) candidates.add(y);
  candidates.add(y0);
  candidates.add(y1);

  const candList = Array.from(candidates).sort((a, b) => a - b);
  lastRight = -Infinity;
  const kept: number[] = [];

  // First pass: add all candidates that fit with proper spacing
  for (const y of candList) {
    const x = yearToX(y);
    const w = measureText(String(y));
    if (x >= lastRight + labelGapPx) {
      kept.push(y);
      lastRight = x + w;
    }
  }

  // Second pass: ensure endpoints are included, removing conflicting years if necessary
  // Priority: y0 (first year) and y1 (last year) are most important
  
  // Ensure y0 is included
  if (!kept.includes(y0)) {
    const y0X = yearToX(y0);
    const y0W = measureText(String(y0));
    
    // Find years that conflict with y0 - check both sides
    const conflictingWithY0 = kept.filter(y => {
      const yX = yearToX(y);
      const yW = measureText(String(y));
      
      // Check if labels overlap or are too close
      // y0 is to the left, so check if any label is too close on the right
      return (y0X + y0W + labelGapPx > yX) && (y0X < yX + yW + labelGapPx);
    });
    
    // Remove conflicting years and add y0
    if (conflictingWithY0.length > 0) {
      kept.splice(0, conflictingWithY0.length);
    }
    // Always add y0, regardless of conflicts
    kept.unshift(y0);
  }
  
  // Ensure y1 is included (highest priority)
  if (!kept.includes(y1)) {
    const y1X = yearToX(y1);
    const y1W = measureText(String(y1));
    
    // Find years that conflict with y1 - check both sides
    const conflictingWithY1 = kept.filter(y => {
      const yX = yearToX(y);
      const yW = measureText(String(y));
      
      // Check if labels overlap or are too close
      // y1 is to the right, so check if any label is too close on the left
      return (yX + yW + labelGapPx > y1X) && (yX < y1X + y1W + labelGapPx);
    });
    
    // Remove conflicting years and add y1
    if (conflictingWithY1.length > 0) {
      // Remove from the end to prioritize y1
      kept.splice(kept.length - conflictingWithY1.length, conflictingWithY1.length);
    }
    // Always add y1, regardless of conflicts
    kept.push(y1);
  }

  return Array.from(new Set(kept)).sort((a, b) => a - b);
}

const MinimapContainer = styled.div`
  background: #FFFFFF;
  padding: 16px 24px; /* 24px padding on left and right */
  width: 100%;
  overflow: visible; /* Allow content to extend beyond container bounds */
  min-width: 0; /* Allow container to shrink */
`;

const MinimapWrapper = styled.div`
  position: relative;
  height: 60px;
  padding: 8px 0 16px 0; /* Increased bottom padding to accommodate blue dot */
  overflow: visible; /* Changed from hidden to visible to show blue dot */
  width: 100%;
  min-width: 0; /* Allow wrapper to shrink */
  flex: 1; /* Scale horizontally to available width */
  
  /* White baseline */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: white;
    z-index: 1;
  }
`;

const Baseline = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: #d1d5db;
  z-index: 1;
`;

const MinimapBar = styled.div<{ height: number; isActive: boolean; width: number; position: number; isHighlighted?: boolean; hasData?: boolean }>`
  position: absolute;
  bottom: 0;
  left: ${props => props.position - props.width / 2}px;
  width: ${props => props.width}px;
  height: ${props => Math.max(props.height, 4)}px;
  background: ${props => props.hasData ? '#94A3B8' : 'transparent'}; /* Transparent for empty months */
  border-radius: 2px 2px 0 0; /* Rounded top corners */
  cursor: ${props => props.hasData ? 'pointer' : 'default'}; /* Only clickable if has data */
  transition: all 0.2s ease;
  z-index: 2;
  
  /* Increase hover area by 2px on each side */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -2px;
    right: -2px;
    bottom: 0;
    background: transparent;
    z-index: -1;
  }
  
  &:hover {
    background: ${props => props.hasData ? '#64748b' : 'transparent'}; /* Only hover effect if has data */
    opacity: ${props => props.hasData ? 0.8 : 1}; /* Only opacity change if has data */
  }
`;

const CustomTooltip = styled.div<{ visible: boolean; x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: #1f2937; /* Dark background */
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.15s ease;
  transform: translateX(-50%) translateY(-100%); /* Position above the bars */
  pointer-events: none; /* Prevent tooltip from interfering with mouse events */
`;

const BlueDot = styled.div<{ position: number }>`
  position: absolute;
  bottom: -6px;
  left: ${props => props.position}px;
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateX(-50%);
  z-index: 10;
`;

const YearLabel = styled.div<{ position: number; hasData?: boolean }>`
  position: absolute;
  left: ${props => props.position}px;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: ${props => props.hasData ? '600' : '400'}; /* Strong font weight for years with documents */
  color: ${props => props.hasData ? '#1f2937' : '#6b7280'};
  white-space: nowrap;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  user-select: none; /* Prevent text selection */
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
  
  &:active {
    background: #e5e7eb;
    color: #111827;
  }
`;

const YearLabels = styled.div`
  display: flex;
  margin-top: 8px;
  font-size: 12px;
  color: #4b5563; /* Dark blue-gray color */
  height: 20px;
  position: relative;
  width: 100%;
`;

interface MultiYearMinimapProps {
  docs: Doc[];
  selectedDocId?: string;
  onBarClick: (date: Date) => void;
  isPreviewVisible?: boolean;
  onYearClick?: (year: number) => void;
}

const MultiYearMinimap: React.FC<MultiYearMinimapProps> = ({
  docs,
  selectedDocId,
  onBarClick,
  isPreviewVisible = false,
  onYearClick
}) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });
  
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track viewport width changes
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate monthly data for each year, including invisible bars for empty months
  const monthlyData = useMemo(() => {
    const months = [];
    
    // Calculate the actual year range from the documents
    const years = docs.map(doc => new Date(doc.date).getFullYear());
    const minYear = years.length > 0 ? Math.min(...years) : 2021;
    const maxYear = years.length > 0 ? Math.max(...years) : 2021;
    
    // Generate all months for the actual year range
    for (let year = minYear; year <= maxYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthDocs = docs.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate.getFullYear() === year && docDate.getMonth() === month;
        });
        
        months.push({
          year,
          month,
          monthName: new Date(year, month).toLocaleDateString('en-US', { month: 'short' }),
          yearMonth: `${year}-${month}`,
          count: monthDocs.length,
          docs: monthDocs,
          hasData: monthDocs.length > 0
        });
      }
    }
    
    return months;
  }, [docs]);

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1); // Ensure maxCount is at least 1

  // Calculate bar heights and widths - each bar is exactly 4px wide
  // Group bars by year and distribute them evenly across the container width
  const monthlyDataWithHeights = useMemo(() => {
    const barWidth = 4; // Fixed 4px width for each bar
    const barsPerYear = 12; // 12 months per year
    // Calculate the actual year range from the documents
    const years = docs.map(doc => new Date(doc.date).getFullYear());
    const minYear = years.length > 0 ? Math.min(...years) : 2021;
    const maxYear = years.length > 0 ? Math.max(...years) : 2021;
    const totalYears = maxYear - minYear + 1; // Dynamic total years
    const totalBars = totalYears * barsPerYear; // Total number of bars
    
    return monthlyData.map((data, index) => {
      // Use the actual measured container width for dynamic calculation
      // Account for the sidebar width (64px) and container padding
      const sidebarWidth = 64; // Left sidebar width
      const leftPadding = 24; // Left padding within calendar area
      
      // Calculate available width considering preview panel visibility
      let availableWidth;
      if (isPreviewVisible) {
        // When preview panel is visible, scale to available width to the left of preview panel
        const previewPanelWidth = 620; // Preview panel width
        availableWidth = viewportWidth - sidebarWidth - previewPanelWidth - leftPadding - 24; // 24px right padding
      } else {
        // When preview panel is not visible, span whole viewport width with 24px right padding
        availableWidth = viewportWidth - sidebarWidth - leftPadding - 24; // 24px right padding
      }
      
      // Calculate spacing: distribute bars evenly across available width
      const totalBarWidth = totalBars * barWidth;
      const totalSpacing = availableWidth - totalBarWidth;
      const spacing = totalSpacing / (totalBars - 1);
      
      // Calculate position for each bar
      const position = leftPadding + (index * (barWidth + spacing)) + (barWidth / 2);
      
      return {
        ...data,
        height: data.count > 0 ? Math.max((data.count / maxCount) * 50, 4) : 4,
        width: barWidth, // 4px width
        position: position // Position for blue dot
      };
    });
  }, [monthlyData, maxCount, isPreviewVisible, docs, viewportWidth]);

  // Calculate year label positions using precise collision detection algorithm
  const yearLabelPositions = useMemo(() => {
    // Calculate the actual year range from the documents
    const docYears = docs.map(doc => new Date(doc.date).getFullYear());
    const minYear = docYears.length > 0 ? Math.min(...docYears) : 2021;
    const maxYear = docYears.length > 0 ? Math.max(...docYears) : 2021;
    
    // Calculate available width for labels
    const availableWidth = viewportWidth - 64 - 24 - (isPreviewVisible ? 620 : 0) - 24; // Account for sidebar, padding, preview panel
    
    // Create year-to-x mapping function
    const yearToX = (year: number): number => {
      const yearBars = monthlyDataWithHeights.filter(data => data.year === year);
      
      if (yearBars.length > 0) {
        const firstBar = yearBars[0];
        return year === minYear ? firstBar.position - 8 : firstBar.position;
      } else {
        // Calculate position for years without documents
        const yearIndex = year - minYear;
        const totalYears = maxYear - minYear + 1;
        const barWidth = 4;
        const barsPerYear = 12;
        const totalBars = totalYears * barsPerYear;
        const totalBarWidth = totalBars * barWidth;
        const totalSpacing = availableWidth - totalBarWidth;
        const spacing = totalSpacing / (totalBars - 1);
        const leftPadding = 24;
        
        const barIndex = yearIndex * barsPerYear;
        return leftPadding + (barIndex * (barWidth + spacing)) + (barWidth / 2);
      }
    };
    
    // Create text measurement function
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
    const textCache = new Map<string, number>();
    
    const measureText = (text: string): number => {
      if (!textCache.has(text)) {
        textCache.set(text, ctx.measureText(text).width);
      }
      return textCache.get(text)!;
    };
    
    // Compute labels using the precise algorithm
    const labelYears = computeYearLabels({
      y0: minYear,
      y1: maxYear,
      widthPx: availableWidth,
      yearToX,
      measureText
    });
    
    // Convert to the expected format
    return labelYears.map(year => ({
      year,
      position: yearToX(year),
      hasDocuments: docs.some(doc => new Date(doc.date).getFullYear() === year)
    }));
  }, [monthlyDataWithHeights, docs, isPreviewVisible, viewportWidth]);

  // Calculate blue dot position for selected document
  const blueDotPosition = useMemo(() => {
    if (!selectedDocId) return -1;
    
    const selectedDoc = docs.find(doc => doc.id === selectedDocId);
    if (!selectedDoc) return -1;
    
    const docDate = new Date(selectedDoc.date);
    const docYear = docDate.getFullYear();
    const docMonth = docDate.getMonth();
    
    const monthData = monthlyDataWithHeights.find(d => d.year === docYear && d.month === docMonth);
    return monthData ? monthData.position : -1;
  }, [selectedDocId, docs, monthlyDataWithHeights]);

  const handleBarClick = (year: number, month: number) => {
    const newDate = new Date(year, month, 1);
    onBarClick(newDate);
  };

  const handleYearClick = (year: number) => {
    // Immediate response - no delays
    onYearClick?.(year);
  };

  const handleBarMouseEnter = (event: React.MouseEvent, data: any) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    const containerRect = event.currentTarget.closest('[data-minimap-container]')?.getBoundingClientRect();
    
    if (containerRect) {
      // Calculate the center position of the bar relative to the container
      const barCenterX = data.position;
      // Calculate Y position higher up to avoid obscuring bars
      const tooltipY = 40; // Fixed position near the top of the minimap
      
      // Small delay to prevent flickering
      const timeout = setTimeout(() => {
        setTooltip({
          visible: true,
          x: barCenterX,
          y: tooltipY,
          content: `${data.monthName} ${data.year}\n${data.count} documents`
        });
      }, 100);
      
      setHoverTimeout(timeout);
    }
  };

  const handleBarMouseLeave = () => {
    // Clear timeout and hide tooltip
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <MinimapContainer ref={containerRef} data-minimap-container>
      <MinimapWrapper>
        <Baseline />
        {monthlyDataWithHeights.map((data, index) => (
          <MinimapBar
            key={data.yearMonth}
            height={data.height}
            width={data.width}
            position={data.position}
            isActive={false}
            hasData={data.hasData}
            isHighlighted={!!(selectedDocId && docs.find(doc => {
              const docDate = new Date(doc.date);
              return doc.id === selectedDocId && 
                     docDate.getFullYear() === data.year && 
                     docDate.getMonth() === data.month;
            }))}
            onClick={data.hasData ? () => handleBarClick(data.year, data.month) : undefined}
            onMouseEnter={data.hasData ? (e) => handleBarMouseEnter(e, data) : undefined}
            onMouseLeave={data.hasData ? handleBarMouseLeave : undefined}
          />
        ))}
        
        {/* Custom tooltip */}
        <CustomTooltip
          visible={tooltip.visible}
          x={tooltip.x}
          y={tooltip.y}
        >
          {tooltip.content.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </CustomTooltip>
        
        {/* Blue dot for selected document */}
        {blueDotPosition >= 0 && (
          <BlueDot position={blueDotPosition} />
        )}
      </MinimapWrapper>
      
          <YearLabels>
            {yearLabelPositions.map(({ year, position }) => {
              const hasData = docs.some(doc => {
                const docDate = new Date(doc.date);
                return docDate.getFullYear() === year;
              });
              
              return (
                <YearLabel 
                  key={year} 
                  position={position}
                  hasData={hasData}
                  onClick={() => handleYearClick(year)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Navigate to year ${year}`}
                >
                  {year}
                </YearLabel>
              );
            })}
          </YearLabels>
    </MinimapContainer>
  );
};

export default MultiYearMinimap;
