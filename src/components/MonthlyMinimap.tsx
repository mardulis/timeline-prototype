import React, { useMemo, useState, useEffect } from 'react';
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
  padding: 8px 0 16px 0;
  overflow: visible;
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

const MinimapBar = styled.div<{ height: number; isActive: boolean; width: number; position: number; isHighlighted?: boolean; hasData?: boolean }>`
  position: absolute;
  bottom: 0;
  left: ${props => props.position - props.width / 2}px;
  width: ${props => props.width}px;
  height: ${props => Math.max(props.height, 4)}px;
  background: ${props => props.hasData ? '#94A3B8' : 'transparent'}; /* Transparent for empty days */
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
    background: ${props => props.hasData ? '#99C9FF' : 'transparent'}; /* Updated hover color */
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
  z-index: 100; /* Higher than timeframe section (z-index: 50) */
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

const MonthLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #4b5563;
  height: 20px;
  position: relative;
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

interface MonthlyMinimapProps {
  docs: Doc[];
  selectedDocId?: string;
  currentYear: number;
  currentMonth: number;
  onBarClick: (date: Date) => void;
  onMonthClick?: (month: number) => void;
  isPreviewVisible?: boolean;
}

const MonthlyMinimap: React.FC<MonthlyMinimapProps> = ({
  docs,
  selectedDocId,
  currentYear,
  currentMonth,
  onBarClick,
  onMonthClick,
  isPreviewVisible = false
}) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Track viewport width changes
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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

  // Generate daily data for all days in the current year, including invisible bars for empty days
  const yearlyData = useMemo(() => {
    const days = [];
    
    // Always generate all days for all 12 months of the current year, regardless of data
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDocs = docs.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate.getFullYear() === currentYear && 
                 docDate.getMonth() === month && 
                 docDate.getDate() === day;
        });
        
        // Always add bars (visible or invisible) to maintain time spacing
        days.push({
          day,
          month,
          monthName: new Date(currentYear, month, 1).toLocaleDateString('en-US', { month: 'short' }),
          count: dayDocs.length,
          height: dayDocs.length > 0 ? Math.max((dayDocs.length / 20) * 50, 4) : 4,
          hasData: dayDocs.length > 0
        });
      }
    }
    
    return days;
  }, [docs, currentYear]);

  const maxCount = Math.max(...yearlyData.map(d => d.count), 1); // Ensure maxCount is at least 1

  // Calculate bar heights and widths with dynamic scaling
  const yearlyDataWithHeights = useMemo(() => {
    const barWidth = 4; // Fixed 4px width for each bar
    const totalDays = yearlyData.length;
    const totalBars = totalDays;
    
    const leftPadding = 24; // Left padding within calendar area
    
    // Calculate available width considering preview panel visibility
      let availableWidth;
      if (isPreviewVisible) {
        // When preview panel is visible, scale to available width to the left of preview panel
        const sidebarWidth = 64; // Left sidebar width
        const previewPanelWidth = 620; // Preview panel width
        availableWidth = viewportWidth - sidebarWidth - previewPanelWidth - leftPadding - 24; // 24px right padding
      } else {
        // When preview panel is not visible, span whole viewport width with 24px right padding
        const sidebarWidth = 64; // Left sidebar width
        availableWidth = viewportWidth - sidebarWidth - leftPadding - 24; // 24px right padding
      }
    
    // Calculate spacing: distribute bars evenly across available width
    const totalBarWidth = totalBars * barWidth;
    const totalSpacing = availableWidth - totalBarWidth;
    const spacing = totalSpacing / (totalBars - 1);
    
    return yearlyData.map((data, index) => {
      const position = leftPadding + (index * (barWidth + spacing)) + (barWidth / 2);
      
      return {
        ...data,
        height: data.count > 0 ? Math.max((data.count / maxCount) * 50, 4) : 4,
        width: barWidth, // 4px width
        position: position // Position for blue dot
      };
    });
  }, [yearlyData, maxCount, isPreviewVisible, viewportWidth]);

  // Calculate blue dot position for selected document
  const blueDotPosition = useMemo(() => {
    if (!selectedDocId) return -1;
    
    const selectedDoc = docs.find(doc => doc.id === selectedDocId);
    if (!selectedDoc) return -1;
    
    const docDate = new Date(selectedDoc.date);
    if (docDate.getFullYear() !== currentYear) {
      return -1;
    }
    
    const dayData = yearlyDataWithHeights.find(d => 
      d.month === docDate.getMonth() && d.day === docDate.getDate()
    );
    return dayData ? dayData.position : -1;
  }, [selectedDocId, docs, currentYear, yearlyDataWithHeights]);

  const handleBarClick = (day: number, month: number) => {
    const newDate = new Date(currentYear, month, day);
    onBarClick(newDate);
  };

  const handleMonthClick = (month: number) => {
    onMonthClick?.(month);
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
      const tooltipY = 30 + 4; // 30px higher + 4px offset below (within bounds)
      const dateStr = new Date(currentYear, data.month, data.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Small delay to prevent flickering
      const timeout = setTimeout(() => {
        setTooltip({
          visible: true,
          x: barCenterX,
          y: tooltipY, // Fixed position below minimap bottom border
          content: `${dateStr}\n${data.count} documents`
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

  // Calculate month label positions based on actual bar positions
  const monthLabels = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((monthName, monthIndex) => {
      // Find all bars for this month
      const monthBars = yearlyDataWithHeights.filter(d => d.month === monthIndex);
      
      // Calculate position based on month index (even if no bars)
      const totalDays = yearlyDataWithHeights.length;
      const daysPerMonth = totalDays / 12;
      const monthStartIndex = monthIndex * daysPerMonth;
      const firstBar = yearlyDataWithHeights[Math.floor(monthStartIndex)];
      const position = firstBar ? firstBar.position : (monthIndex * (totalDays / 12) * 4) + 24;
      
      return {
        monthName,
        position,
        hasData: monthBars.length > 0
      };
    });
  }, [yearlyDataWithHeights]);

  // Calculate DOL (Date of Loss) position for March 27, 2020
  const dolPosition = useMemo(() => {
    const dolDate = new Date(2020, 2, 27); // March 27, 2020 (month is 0-indexed)
    const dolYear = dolDate.getFullYear();
    const dolMonth = dolDate.getMonth();
    const dolDay = dolDate.getDate();
    
    // Only show DOL if we're viewing the year 2020
    if (currentYear !== dolYear) {
      return -1;
    }
    
    // Find the position for this date in the yearly data
    const dolData = yearlyDataWithHeights.find(data => 
      data.month === dolMonth && data.day === dolDay
    );
    
    return dolData ? dolData.position : -1;
  }, [yearlyDataWithHeights, currentYear]);

  // DOL tooltip state
  const [dolTooltip, setDolTooltip] = useState({ visible: false, x: 0, y: 0 });

    const handleDOLMouseEnter = (e: React.MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = e.currentTarget.closest('[data-minimap-container]')?.getBoundingClientRect();
    
    if (containerRect) {
      setDolTooltip({
        visible: true,
        x: dolPosition, // Use DOL position directly, same as bar tooltips use data.position
        y: 30 + 4 // Same fixed position as bar tooltips
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
    <MinimapContainer data-minimap-container>
      <MinimapWrapper>
        <Baseline />
        {yearlyDataWithHeights.map((data, index) => (
          <MinimapBar
            key={`${data.month}-${data.day}`}
            height={data.height}
            width={data.width}
            position={data.position}
            isActive={false}
            hasData={data.hasData}
            isHighlighted={!!(selectedDocId && docs.find(doc => {
              const docDate = new Date(doc.date);
              return doc.id === selectedDocId && 
                     docDate.getFullYear() === currentYear && 
                     docDate.getMonth() === data.month &&
                     docDate.getDate() === data.day;
            }))}
            onClick={data.hasData ? () => handleBarClick(data.day, data.month) : undefined}
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
        
        {/* DOL tooltip */}
        <CustomTooltip
          visible={dolTooltip.visible}
          x={dolTooltip.x}
          y={dolTooltip.y}
        >
          <div>Date of Loss</div>
          <div>March 27, 2020</div>
        </CustomTooltip>
        
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
      
      <MonthLabels>
        {monthLabels.map((label, index) => {
          return (
            <span 
              key={label.monthName} 
              style={{ 
                position: 'absolute',
                left: `${label.position}px`,
                transform: 'translateX(-50%)',
                fontSize: '12px',
                color: label.hasData ? '#1f2937' : '#6b7280',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                userSelect: 'none', // Prevent text selection
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleMonthClick(index)}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.backgroundColor = '#f3f4f6'; // All months get hover background
                target.style.color = label.hasData ? '#111827' : '#374151'; // Slightly darker for empty months too
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLElement;
                target.style.backgroundColor = 'transparent';
                target.style.color = label.hasData ? '#1f2937' : '#6b7280';
              }}
            >
              {label.monthName}
            </span>
          );
        })}
      </MonthLabels>
    </MinimapContainer>
  );
};

export default MonthlyMinimap;
