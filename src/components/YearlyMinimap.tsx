import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Doc } from '../types/Timeline';

const MinimapContainer = styled.div`
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const MinimapWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: end;
  gap: 2px;
  height: 60px;
  padding: 8px 0;
`;

const MinimapBar = styled.div<{ height: number; isActive: boolean }>`
  width: 12px;
  height: ${props => Math.max(props.height, 4)}px;
  background: ${props => props.isActive ? '#3b82f6' : '#d1d5db'};
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #6b7280;
    opacity: 0.8;
  }
`;

const BlueDot = styled.div<{ position: number }>`
  position: absolute;
  bottom: -8px;
  left: ${props => props.position}px;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateX(-50%);
  z-index: 10;
`;

const MonthLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
`;

interface YearlyMinimapProps {
  docs: Doc[];
  selectedDocId?: string;
  onBarClick: (date: Date) => void;
  currentYear?: number;
}

const YearlyMinimap: React.FC<YearlyMinimapProps> = ({
  docs,
  selectedDocId,
  onBarClick,
  currentYear = 2021
}) => {
  // Generate monthly data for the current year based on actual documents
  const monthlyData = useMemo(() => {
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthDocs = docs.filter(doc => {
        const docDate = new Date(doc.date);
        return docDate.getFullYear() === currentYear && docDate.getMonth() === month;
      });
      
      months.push({
        month,
        monthName: new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' }),
        count: monthDocs.length,
        height: monthDocs.length > 0 ? Math.max((monthDocs.length / 50) * 50, 4) : 4
      });
    }
    
    return months;
  }, [docs, currentYear]);

  const maxCount = Math.max(...monthlyData.map(d => d.count));

  // Calculate blue dot position for selected document
  const blueDotPosition = useMemo(() => {
    if (!selectedDocId) return -1;
    
    const selectedDoc = docs.find(doc => doc.id === selectedDocId);
    if (!selectedDoc) return -1;
    
    const docDate = new Date(selectedDoc.date);
    if (docDate.getFullYear() !== currentYear) return -1;
    
    const month = docDate.getMonth();
    
    // Calculate position based on month index
    const barWidth = 12;
    const gap = 2;
    return month * (barWidth + gap) + barWidth / 2;
  }, [selectedDocId, docs, currentYear]);

  const handleBarClick = (month: number) => {
    const newDate = new Date(currentYear, month, 1);
    onBarClick(newDate);
  };

  return (
    <MinimapContainer>
      <MinimapWrapper>
        {monthlyData.map((data, index) => (
          <MinimapBar
            key={data.month}
            height={data.count > 0 ? (data.count / maxCount) * 50 : 4}
            isActive={false}
            onClick={() => handleBarClick(data.month)}
            title={`${data.monthName}: ${data.count} documents`}
          />
        ))}
        
        {/* Blue dot for selected document */}
        {blueDotPosition >= 0 && (
          <BlueDot position={blueDotPosition} />
        )}
      </MinimapWrapper>
      
      <MonthLabels>
        {monthlyData.map(data => (
          <span key={data.month}>{data.monthName}</span>
        ))}
      </MonthLabels>
    </MinimapContainer>
  );
};

export default YearlyMinimap;
