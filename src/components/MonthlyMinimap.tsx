import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Doc } from '../types/Timeline';

const MinimapContainer = styled.div`
  background: #FFFFFF;
  padding: 16px 24px 6px 24px; /* 16px top, 24px left/right, 6px bottom */
  width: 100%;
  overflow: visible; /* Allow content to extend beyond container bounds */
  min-width: 0; /* Allow container to shrink */
`;

const MinimapWrapper = styled.div`
  position: relative;
  height: 32px;
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

const MinimapBar = styled.div<{ height: number; isActive: boolean; width: number; position: number; isHighlighted?: boolean; hasData?: boolean; isMonthHovered?: boolean }>`
  position: absolute;
  bottom: 0;
  left: ${props => props.position - props.width / 2}px;
  width: ${props => props.width}px;
  height: ${props => Math.max(props.height, 4)}px;
  background: ${props => {
    if (!props.hasData) return 'transparent';
    return props.isMonthHovered ? '#66aeff' : '#94a3b8'; /* Blue when month is hovered, gray otherwise */
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

const MonthHoverArea = styled.div<{ left: number; width: number }>`
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

const MonthTooltip = styled.div<{ visible: boolean; x: number; y: number }>`
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
  onScaleChange?: (scale: 'year' | 'month' | 'day') => void;
  onMonthChange?: (month: number) => void;
}

const MonthlyMinimap: React.FC<MonthlyMinimapProps> = ({
  docs,
  selectedDocId,
  currentYear,
  currentMonth,
  onBarClick,
  onMonthClick,
  isPreviewVisible = false,
  onScaleChange,
  onMonthChange
}) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [monthTooltip, setMonthTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    month: number;
    count: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    month: 0,
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
  const containerRef = useRef<HTMLDivElement>(null);

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
        height: data.count > 0 ? Math.max((data.count / maxCount) * 24, 4) : 4, // Max 24px height
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
      // Calculate screen position for fixed tooltip
      const barCenterX = containerRect.left + 24 + data.position; // 24px = left padding
      const tooltipY = containerRect.top + 16 - 6; // 16px = top padding, -6 to move up
      const dateStr = new Date(currentYear, data.month, data.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Small delay to prevent flickering
      const timeout = setTimeout(() => {
        setTooltip({
          visible: true,
          x: barCenterX,
          y: tooltipY, // Fixed position above minimap bars
          content: `${dateStr}\n${data.count === 0 ? 'No documents' : `${data.count} ${data.count === 1 ? 'document' : 'documents'}`}`
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

  // Calculate month hover areas
  const monthHoverAreas = useMemo(() => {
    const areas = [];
    
    for (let month = 0; month < 12; month++) {
      const monthBars = yearlyDataWithHeights.filter(d => d.month === month);
      
      if (monthBars.length > 0) {
        const firstBar = monthBars[0];
        const lastBar = monthBars[monthBars.length - 1];
        
        // Calculate left position (start of first bar)
        const left = firstBar.position - (firstBar.width / 2);
        // Calculate width (from start of first bar to end of last bar)
        const width = (lastBar.position + (lastBar.width / 2)) - left;
        
        areas.push({
          month,
          left,
          width
        });
      }
    }
    
    return areas;
  }, [yearlyDataWithHeights]);

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
        x: containerRect.left + 24 + dolPosition, // Convert to screen coordinates
        y: containerRect.top + 16 - 6 // Same fixed position as bar tooltips (moved up 40px)
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
        {yearlyDataWithHeights.map((data, index) => (
          <MinimapBar
            key={`${data.month}-${data.day}`}
            height={data.height}
            width={data.width}
            position={data.position}
            isActive={false}
            hasData={data.hasData}
            isMonthHovered={hoveredMonth === data.month}
            isHighlighted={!!(selectedDocId && docs.find(doc => {
              const docDate = new Date(doc.date);
              return doc.id === selectedDocId && 
                     docDate.getFullYear() === currentYear && 
                     docDate.getMonth() === data.month &&
                     docDate.getDate() === data.day;
            }))}
          />
        ))}
        
        {/* Month hover areas */}
        {monthHoverAreas.map(({ month, left, width }) => {
          const monthDocs = docs.filter(doc => {
            const docDate = new Date(doc.date);
            return docDate.getFullYear() === currentYear && docDate.getMonth() === month;
          });
          const centerX = left + (width / 2);
          
          return (
            <MonthHoverArea
              key={month}
              left={left}
              width={width}
              onClick={() => handleMonthClick(month)}
              onMouseEnter={(e) => {
                setHoveredMonth(month);
                // Calculate screen position for fixed tooltip - centered on the hover area
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (containerRect) {
                  const screenX = containerRect.left + 24 + centerX; // Center horizontally on the month section (24px = left padding)
                  const screenY = containerRect.top + 16 + 8 + 14 - 20; // 16px container top padding + 8px wrapper top padding + 14px (half of 28px hover area) - 20px offset
                  setMonthTooltip({
                    visible: true,
                    x: screenX,
                    y: screenY,
                    month: month,
                    count: monthDocs.length
                  });
                }
              }}
              onMouseLeave={() => {
                setHoveredMonth(null);
                setMonthTooltip(prev => ({ ...prev, visible: false }));
              }}
            />
          );
        })}
        
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
              onClick={() => {
                // Switch to Day view and set the month context
                try {
                  if (onScaleChange && onMonthChange) {
                    onMonthChange(index);
                    onScaleChange('day');
                  }
                } catch (error) {
                  console.error('Error switching to day view:', error);
                }
              }}
              onMouseEnter={(e) => {
                try {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = 'rgba(230, 241, 255, 0.5)'; // Match minimap hover - light blue with transparency
                  target.style.color = label.hasData ? '#111827' : '#374151'; // Slightly darker for empty months too
                  
                  // Show label tooltip
                  const rect = target.getBoundingClientRect();
                  if (rect) {
                    setLabelTooltip({
                      visible: true,
                      x: rect.left + rect.width / 2,
                      y: rect.top, // Position above the label
                      text: `View ${label.monthName} documents`
                    });
                  }
                } catch (error) {
                  console.error('Error showing label tooltip:', error);
                }
              }}
              onMouseLeave={(e) => {
                try {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = 'transparent';
                  target.style.color = label.hasData ? '#1f2937' : '#6b7280';
                  setLabelTooltip(prev => ({ ...prev, visible: false }));
                } catch (error) {
                  console.error('Error hiding label tooltip:', error);
                }
              }}
            >
              {label.monthName}
            </span>
          );
        })}
      </MonthLabels>
    </MinimapContainer>
    {/* Month section tooltip - rendered via portal to escape all parent stacking contexts */}
    {monthTooltip.visible && createPortal(
      <MonthTooltip
        visible={monthTooltip.visible}
        x={monthTooltip.x}
        y={monthTooltip.y}
      >
        {monthTooltip.count === 0 ? 'No documents' : `${monthTooltip.count} document${monthTooltip.count !== 1 ? 's' : ''}`}
      </MonthTooltip>,
      document.body
    )}
    {/* Label tooltip - rendered via portal */}
    {labelTooltip.visible && createPortal(
      <MonthTooltip
        visible={labelTooltip.visible}
        x={labelTooltip.x}
        y={labelTooltip.y}
      >
        {labelTooltip.text}
      </MonthTooltip>,
      document.body
    )}
    {/* Bar tooltip - rendered via portal to escape all parent stacking contexts */}
    {tooltip.visible && createPortal(
      <CustomTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
      >
        {tooltip.content.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </CustomTooltip>,
      document.body
    )}
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
    </>
  );
};

export default MonthlyMinimap;
