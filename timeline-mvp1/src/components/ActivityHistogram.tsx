import React from 'react';
import styled from 'styled-components';
import MultiYearMinimap from './MultiYearMinimap';
import MonthlyMinimap from './MonthlyMinimap';
import DailyMinimap from './DailyMinimap';
import { ActivityHistogramProps, TimeScale } from '../types/Timeline';

const HistogramContainer = styled.div`
  background: white;
`;

interface EnhancedActivityHistogramProps extends ActivityHistogramProps {
  scale: TimeScale;
  currentYear?: number;
  currentMonth?: number;
}

const ActivityHistogram: React.FC<EnhancedActivityHistogramProps> = ({
  docs,
  selectedDocId,
  onBarClick,
  onScrubberDrag,
  scale,
  currentYear = 2021,
  currentMonth = 0,
  isPreviewVisible = false,
  onYearClick,
  onMonthClick,
  onDayClick,
  onScaleChange,
  onYearChange,
  onMonthChange
}) => {
  const renderMinimap = () => {
    switch (scale) {
      case 'year':
        return (
          <MultiYearMinimap
            docs={docs}
            selectedDocId={selectedDocId}
            onBarClick={onBarClick}
            isPreviewVisible={isPreviewVisible}
            onYearClick={onYearClick}
            onScaleChange={onScaleChange}
            onYearChange={onYearChange}
          />
        );
      case 'month':
        return (
          <MonthlyMinimap
            docs={docs}
            selectedDocId={selectedDocId}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onBarClick={onBarClick}
            onMonthClick={onMonthClick}
            isPreviewVisible={isPreviewVisible}
            onScaleChange={onScaleChange}
            onMonthChange={onMonthChange}
          />
        );
      case 'day':
        return (
          <DailyMinimap
            docs={docs}
            selectedDocId={selectedDocId}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onBarClick={onBarClick}
            onDayClick={onDayClick}
            isPreviewVisible={isPreviewVisible}
          />
        );
      default:
        return (
          <MultiYearMinimap
            docs={docs}
            selectedDocId={selectedDocId}
            onBarClick={onBarClick}
          />
        );
    }
  };

  return (
    <HistogramContainer>
      {renderMinimap()}
    </HistogramContainer>
  );
};

export default ActivityHistogram;
