import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  padding: 16px 24px 6px 24px; /* 16px top, 24px left/right, 6px bottom */
  width: 100%;
  overflow: visible; /* Allow content to extend beyond container bounds */
  min-width: 0; /* Allow container to shrink */
  position: relative; /* Enable absolute positioning for tooltips */
`;

const MinimapWrapper = styled.div`
  position: relative;
  height: 32px;
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

const MinimapBar = styled.div<{ height: number; isActive: boolean; width: number; position: number; isHighlighted?: boolean; hasData?: boolean; isYearHovered?: boolean }>`
  position: absolute;
  bottom: 0;
  left: ${props => props.position - props.width / 2}px;
  width: ${props => props.width}px;
  height: ${props => Math.max(props.height, 4)}px;
  background: ${props => {
    if (!props.hasData) return 'transparent';
    return props.isYearHovered ? '#66aeff' : '#94a3b8'; /* Blue when year is hovered, gray otherwise */
  }};
  border-radius: 8px 8px 0 0; /* Rounded top corners - 8px from Figma */
  pointer-events: none; /* Bars are no longer clickable */
  transition: all 0.2s ease;
  z-index: 2;
`;

const CustomTooltip = styled.div<{ visible: boolean; x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: #1f2937; /* Dark background */
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 50010; /* Higher than TopSection (50004) and all other elements */
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

const DOLIndicator = styled.div<{ position: number }>`
  position: absolute;
  bottom: -8px;
  left: ${props => props.position}px;
  width: 10px;
  height: 10px;
  background: #dc2626; /* Red color for DOL */
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateX(-50%);
  z-index: 9;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #b91c1c; /* Darker red on hover */
    transform: translateX(-50%) scale(1.2);
  }
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
    background: rgba(230, 241, 255, 0.5); /* Match minimap hover - light blue with transparency */
    color: #111827;
  }
  
  &:active {
    background: #e5e7eb;
    color: #111827;
  }
`;

const YearHoverArea = styled.div<{ left: number; width: number }>`
  position: absolute;
  bottom: 0;
  left: ${props => props.left}px;
  width: ${props => props.width}px;
  height: 28px; /* 24px bars + 4px padding on top */
  background: transparent;
  cursor: pointer;
  z-index: 3;
  transition: background 0.2s ease;
  border-radius: 4px 4px 0 0; /* Top corners rounded - from Figma */
  
  &:hover {
    background: rgba(230, 241, 255, 0.5); /* Brand tertiary color with 50% opacity for lighter effect */
    padding: 4px 0 0 4px; /* Padding from Figma - only on hover to create the offset effect */
  }
`;

const YearTooltip = styled.div<{ visible: boolean; x: number; y: number }>`
  position: fixed; /* Use fixed positioning to escape all parent constraints */
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translateX(-50%) translateY(-100%); /* Position directly above */
  background: #0f172a; /* Dark neutral background from Figma */
  color: #f1f5f9; /* Light text from Figma */
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 400;
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.4;
  white-space: nowrap;
  z-index: 99999; /* Very high z-index to appear above everything */
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.15s ease;
  pointer-events: none;
  box-shadow: 0 1px 4px 0 rgba(3, 7, 18, 0.1), 0 1px 4px 0 rgba(12, 12, 13, 0.05);
  margin-top: -10px; /* 10px gap above the minimap */
  
  /* Beak (arrow pointing down) */
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background: #0f172a;
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
  onScaleChange?: (scale: 'year' | 'month' | 'day') => void;
  onYearChange?: (year: number) => void;
}

const MultiYearMinimap: React.FC<MultiYearMinimapProps> = ({
  docs,
  selectedDocId,
  onBarClick,
  isPreviewVisible = false,
  onYearClick,
  onScaleChange,
  onYearChange
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
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [yearTooltip, setYearTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    year: number;
    count: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    year: 0,
    count: 0
  });
  
  const [labelTooltip, setLabelTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });
  
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
    
    // Use a fixed year range instead of calculating from filtered documents
    const minYear = 2018; // Fixed minimum year
    const maxYear = 2025; // Fixed maximum year
    
    // Generate all months for the fixed year range
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
    // Use the same fixed year range as in monthlyData
    const minYear = 2018; // Fixed minimum year
    const maxYear = 2025; // Fixed maximum year
    const totalYears = maxYear - minYear + 1; // Fixed total years
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
        height: data.count > 0 ? Math.max((data.count / maxCount) * 24, 4) : 4, // Max 24px height
        width: barWidth, // 4px width
        position: position // Position for blue dot
      };
    });
  }, [monthlyData, maxCount, isPreviewVisible, viewportWidth]);

  // Calculate year label positions using precise collision detection algorithm
  const yearLabelPositions = useMemo(() => {
    // Use the same fixed year range as in monthlyData
    const minYear = 2018; // Fixed minimum year
    const maxYear = 2025; // Fixed maximum year
    
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
      // Calculate screen position for fixed tooltip
      const barCenterX = containerRect.left + 24 + data.position; // 24px = left padding
      const tooltipY = containerRect.top + 16 - 6; // 16px = top padding, -6 to move up
      
      // Small delay to prevent flickering
      const timeout = setTimeout(() => {
        setTooltip({
          visible: true,
          x: barCenterX,
          y: tooltipY, // Fixed position below minimap bottom border
          content: `${data.monthName} ${data.year}\n${data.count === 0 ? 'No documents' : `${data.count} ${data.count === 1 ? 'document' : 'documents'}`}`
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

  // Calculate year hover areas
  const yearHoverAreas = useMemo(() => {
    const minYear = 2018;
    const maxYear = 2025;
    const areas = [];
    
    for (let year = minYear; year <= maxYear; year++) {
      const yearBars = monthlyDataWithHeights.filter(data => data.year === year);
      
      if (yearBars.length > 0) {
        const firstBar = yearBars[0];
        const lastBar = yearBars[yearBars.length - 1];
        
        // Calculate left position (start of first bar)
        const left = firstBar.position - (firstBar.width / 2);
        // Calculate width (from start of first bar to end of last bar)
        const width = (lastBar.position + (lastBar.width / 2)) - left;
        
        areas.push({
          year,
          left,
          width
        });
      }
    }
    
    return areas;
  }, [monthlyDataWithHeights]);

  // Calculate DOL (Date of Loss) position for March 27, 2020
  const dolPosition = useMemo(() => {
    const dolDate = new Date(2020, 2, 27); // March 27, 2020 (month is 0-indexed)
    const dolYear = dolDate.getFullYear();
    const dolMonth = dolDate.getMonth();
    
    // Find the position for this month in the monthly data
    const dolData = monthlyDataWithHeights.find(data => 
      data.year === dolYear && data.month === dolMonth
    );
    
    return dolData ? dolData.position : -1;
  }, [monthlyDataWithHeights]);

  // DOL tooltip state
  const [dolTooltip, setDolTooltip] = useState({ visible: false, x: 0, y: 0 });

    const handleDOLMouseEnter = (e: React.MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = e.currentTarget.closest('[data-minimap-container]')?.getBoundingClientRect();
    
    if (containerRect) {
      setDolTooltip({
        visible: true,
        x: containerRect.left + 24 + dolPosition, // Convert to screen coordinates
        y: containerRect.top + 16 - 6 // Same fixed position as other minimaps (moved up 40px)
      });
    }
  };

  const handleDOLMouseLeave = () => {
    setDolTooltip({ visible: false, x: 0, y: 0 });
  };

  const handleDOLClick = () => {
    // Navigate to March 27, 2020
    const dolDate = new Date(2020, 2, 27); // March 27, 2020 (month is 0-indexed)
    onBarClick(dolDate);
  };

  return (
    <>
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
            isYearHovered={hoveredYear === data.year}
            isHighlighted={!!(selectedDocId && docs.find(doc => {
              const docDate = new Date(doc.date);
              return doc.id === selectedDocId && 
                     docDate.getFullYear() === data.year && 
                     docDate.getMonth() === data.month;
            }))}
          />
        ))}
        
        {/* Year hover areas */}
        {yearHoverAreas.map(({ year, left, width }) => {
          const yearDocs = docs.filter(doc => new Date(doc.date).getFullYear() === year);
          const centerX = left + (width / 2);
          
          return (
            <YearHoverArea
              key={year}
              left={left}
              width={width}
              onClick={() => handleYearClick(year)}
              onMouseEnter={(e) => {
                setHoveredYear(year);
                // Calculate screen position for fixed tooltip - centered on the hover area
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (containerRect) {
                  const screenX = containerRect.left + 24 + centerX; // Center horizontally on the year section (24px = left padding)
                  const screenY = containerRect.top + 16 + 8 + 14 - 20; // 16px container top padding + 8px wrapper top padding + 14px (half of 28px hover area) - 20px offset
                  setYearTooltip({
                    visible: true,
                    x: screenX,
                    y: screenY,
                    year: year,
                    count: yearDocs.length
                  });
                }
              }}
              onMouseLeave={() => {
                setHoveredYear(null);
                setYearTooltip(prev => ({ ...prev, visible: false }));
              }}
            />
          );
        })}
        
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
        
        {/* DOL tooltip - rendered via portal */}
        {dolTooltip.visible && createPortal(
          <CustomTooltip
            visible={dolTooltip.visible}
            x={dolTooltip.x}
            y={dolTooltip.y}
          >
            <div>Date of Loss</div>
            <div>March 27, 2020</div>
          </CustomTooltip>,
          document.body
        )}
        
        {/* Blue dot for selected document */}
        {blueDotPosition >= 0 && (
          <BlueDot position={blueDotPosition} />
        )}
        
        {/* DOL indicator for March 27, 2020 */}
        {dolPosition >= 0 && (
          <DOLIndicator 
            position={dolPosition}
            onMouseEnter={handleDOLMouseEnter}
            onMouseLeave={handleDOLMouseLeave}
            onClick={handleDOLClick}
          />
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
                  onClick={() => {
                    // Switch to Month view and set the year context
                    try {
                      if (onScaleChange && onYearChange) {
                        onYearChange(year);
                        onScaleChange('month');
                      }
                    } catch (error) {
                      console.error('Error switching to month view:', error);
                    }
                  }}
                  onMouseEnter={(e) => {
                    try {
                      const target = e.currentTarget as HTMLElement;
                      const rect = target.getBoundingClientRect();
                      if (rect) {
                        setLabelTooltip({
                          visible: true,
                          x: rect.left + rect.width / 2,
                          y: rect.top, // Position above the label
                          text: `View ${year} documents`
                        });
                      }
                    } catch (error) {
                      console.error('Error showing label tooltip:', error);
                    }
                  }}
                  onMouseLeave={() => {
                    setLabelTooltip(prev => ({ ...prev, visible: false }));
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${year} documents`}
                >
                  {year}
                </YearLabel>
              );
            })}
          </YearLabels>
    </MinimapContainer>
    {/* Year section tooltip - rendered via portal to escape all parent stacking contexts */}
    {yearTooltip.visible && createPortal(
      <YearTooltip
        visible={yearTooltip.visible}
        x={yearTooltip.x}
        y={yearTooltip.y}
      >
        {yearTooltip.count === 0 ? 'No documents' : `${yearTooltip.count} document${yearTooltip.count !== 1 ? 's' : ''}`}
      </YearTooltip>,
      document.body
    )}
    {/* Label tooltip - rendered via portal */}
    {labelTooltip.visible && createPortal(
      <YearTooltip
        visible={labelTooltip.visible}
        x={labelTooltip.x}
        y={labelTooltip.y}
      >
        {labelTooltip.text}
      </YearTooltip>,
      document.body
    )}
    </>
  );
};

export default MultiYearMinimap;
