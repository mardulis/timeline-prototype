import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Doc } from '../types/Timeline';

const MinimapContainer = styled.div`
  background: #FFFFFF;
  padding: 16px 32px; /* Increased right padding from 24px to 32px */
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
  transform: translateX(-50%) translateY(-50%); /* Centered vertically */
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

const DayLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #4b5563; /* Dark blue-gray color */
  height: 20px;
  position: relative;
`;

interface DailyMinimapProps {
  docs: Doc[];
  selectedDocId?: string;
  currentYear: number;
  currentMonth: number;
  onBarClick: (date: Date) => void;
  onDayClick?: (day: number) => void;
  isPreviewVisible?: boolean;
}

const DailyMinimap: React.FC<DailyMinimapProps> = ({
  docs,
  selectedDocId,
  currentYear,
  currentMonth,
  onBarClick,
  onDayClick,
  isPreviewVisible = false
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
  // Generate daily data for the current month only, including invisible bars for empty days
  const dailyData = useMemo(() => {
    const days: Array<{
      day: number;
      month: number;
      year: number;
      monthName: string;
      count: number;
      height: number;
      hasData: boolean;
    }> = [];
    
    // Generate all days for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDocs = docs.filter(doc => {
        const docDate = new Date(doc.date);
        return docDate.getFullYear() === currentYear && 
               docDate.getMonth() === currentMonth && 
               docDate.getDate() === day;
      });
      
      // Always add bars (visible or invisible) to maintain time spacing
      days.push({
        day,
        month: currentMonth,
        year: currentYear,
        monthName: new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', { month: 'short' }),
        count: dayDocs.length,
        height: dayDocs.length > 0 ? Math.max((dayDocs.length / 10) * 50, 4) : 4,
        hasData: dayDocs.length > 0
      });
    }
    
    return days;
  }, [docs, currentYear, currentMonth]);

  const maxCount = Math.max(...dailyData.map(d => d.count), 1); // Ensure maxCount is at least 1

  // Calculate bar heights and widths with dynamic scaling
  const dailyDataWithHeights = useMemo(() => {
    const barWidth = 4; // Fixed 4px width for each bar
    
    const leftPadding = 24; // Left padding within calendar area
    
    // Calculate available width considering preview panel visibility
    let availableWidth;
    if (isPreviewVisible) {
      // When preview panel is visible, scale to available width to the left of preview panel
      const viewportWidth = window.innerWidth;
      const sidebarWidth = 64; // Left sidebar width
      const previewPanelWidth = 620; // Preview panel width
      availableWidth = viewportWidth - sidebarWidth - previewPanelWidth - leftPadding - 32; // 32px right padding
    } else {
      // When preview panel is not visible, span whole viewport width with 32px right padding
      const viewportWidth = window.innerWidth;
      const sidebarWidth = 64; // Left sidebar width
      availableWidth = viewportWidth - sidebarWidth - leftPadding - 32; // 32px right padding
    }
    
    // Calculate spacing: ensure all days fit in available width
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalBarWidth = daysInMonth * barWidth;
    const totalSpacing = availableWidth - totalBarWidth;
    const spacing = daysInMonth > 1 ? totalSpacing / (daysInMonth - 1) : 0;
    
    return dailyData.map((data, index) => {
      const position = leftPadding + (index * (barWidth + spacing)) + (barWidth / 2);
      
      return {
        ...data,
        height: data.count > 0 ? Math.max((data.count / maxCount) * 50, 4) : 4,
        width: barWidth, // 4px width
        position: position // Position for blue dot
      };
    });
  }, [dailyData, maxCount, isPreviewVisible, currentYear, currentMonth]);

  // Calculate blue dot position for selected document
  const blueDotPosition = useMemo(() => {
    if (!selectedDocId) return -1;
    
    const selectedDoc = docs.find(doc => doc.id === selectedDocId);
    if (!selectedDoc) return -1;
    
    const docDate = new Date(selectedDoc.date);
    const dayData = dailyDataWithHeights.find(d => 
      d.year === docDate.getFullYear() && 
      d.month === docDate.getMonth() && 
      d.day === docDate.getDate()
    );
    return dayData ? dayData.position : -1;
  }, [selectedDocId, docs, dailyDataWithHeights]);

  const handleBarClick = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day);
    onBarClick(newDate);
  };

  const handleDayClick = (day: number) => {
    onDayClick?.(day);
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
      const tooltipY = 40; // Fixed position near the top of the minimap
      const dateStr = new Date(data.year, data.month, data.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Small delay to prevent flickering
      const timeout = setTimeout(() => {
        setTooltip({
          visible: true,
          x: barCenterX,
          y: tooltipY, // Set to fixed position near top
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

  return (
    <MinimapContainer data-minimap-container>
      <MinimapWrapper>
        <Baseline />
        {dailyDataWithHeights.map((data, index) => (
          <MinimapBar
            key={`${data.year}-${data.month}-${data.day}`}
            height={data.height}
            width={data.width}
            position={data.position}
            isActive={false}
            hasData={data.hasData}
            isHighlighted={!!(selectedDocId && docs.find(doc => {
              const docDate = new Date(doc.date);
              return doc.id === selectedDocId && 
                     docDate.getFullYear() === data.year && 
                     docDate.getMonth() === data.month &&
                     docDate.getDate() === data.day;
            }))}
            onClick={data.hasData ? () => handleBarClick(data.day, data.month, data.year) : undefined}
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
      
      <DayLabels>
        {dailyDataWithHeights.map((data, index) => {
          return (
            <span 
              key={data.day} 
              style={{ 
                position: 'absolute',
                left: `${data.position}px`,
                transform: 'translateX(-50%)',
                fontSize: '12px',
                color: data.hasData ? '#1f2937' : '#6b7280', // Dark for days with docs, gray for empty days
                cursor: 'pointer',
                display: 'block',
                userSelect: 'none' // Prevent text selection
              }}
              onClick={() => handleDayClick(data.day)}
            >
              {data.day}
            </span>
          );
        })}
      </DayLabels>
    </MinimapContainer>
  );
};

export default DailyMinimap;
