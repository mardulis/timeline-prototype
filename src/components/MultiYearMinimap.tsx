import React, { useMemo, useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Doc } from '../types/Timeline';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width and add resize listener
  useEffect(() => {
    const updateWidth = () => {
      // Container width measurement removed as it's not used
    };

    // Initial measurement
    updateWidth();

    // Add resize listener
    window.addEventListener('resize', updateWidth);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [isPreviewVisible]); // Re-measure when preview visibility changes

  // Generate monthly data for each year, including invisible bars for empty months
  const monthlyData = useMemo(() => {
    const months = [];
    
    // Generate all months from 2018 to 2025
    for (let year = 2018; year <= 2025; year++) {
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
    const totalYears = 8; // 2018-2025
    const totalBars = totalYears * barsPerYear; // Total number of bars (96)
    
    return monthlyData.map((data, index) => {
      // Use the actual measured container width for dynamic calculation
      // Account for the sidebar width (64px) and container padding
      const sidebarWidth = 64; // Left sidebar width
      const leftPadding = 24; // Left padding within calendar area
      
      // Calculate available width considering preview panel visibility
      let availableWidth;
      if (isPreviewVisible) {
        // When preview panel is visible, scale to available width to the left of preview panel
        const viewportWidth = window.innerWidth;
        const previewPanelWidth = 620; // Preview panel width
        availableWidth = viewportWidth - sidebarWidth - previewPanelWidth - leftPadding - 24; // 24px right padding
      } else {
        // When preview panel is not visible, span whole viewport width with 24px right padding
        const viewportWidth = window.innerWidth;
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
  }, [monthlyData, maxCount, isPreviewVisible]);

  // Calculate year label positions based on actual bar positions
  const yearLabelPositions = useMemo(() => {
    const years = [];
    
    for (let year = 2018; year <= 2025; year++) {
      // Find all bars for this year
      const yearBars = monthlyDataWithHeights.filter(data => data.year === year);
      
      if (yearBars.length === 0) continue; // Skip years with no bars
      
      // Get the first and last bar positions for this year
      const firstBar = yearBars[0];
      
      let yearPosition;
      if (year === 2018) {
        // Position 2018 label to the left of the first bar
        yearPosition = firstBar.position - 8; // 8px to the left of the first bar
      } else {
        // Position other year labels at the start of their year's bars
        yearPosition = firstBar.position;
      }
      
      years.push({
        year,
        position: yearPosition
      });
    }
    
    return years;
  }, [monthlyDataWithHeights]);

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
