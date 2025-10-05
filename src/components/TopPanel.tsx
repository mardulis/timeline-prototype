import React from 'react';
import styled from 'styled-components';
import { TopPanelProps, Mode } from '../types/Timeline';

const TopPanelContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 24px;
`;

const TopPanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModeChips = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }
`;

const ModeChip = styled.button<{ isActive: boolean; hasIcon?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.hasIcon ? '8px' : '0px'};
  padding: 8px 16px;
  border-radius: 999px; /* Pill-shaped with high border-radius */
  border: none;
  background: ${props => props.isActive ? '#EDF4FF' : 'transparent'}; /* Light blue background for active */
  color: ${props => props.isActive ? '#1E1E1E' : '#6b7280'}; /* Dark gray text for active */
  font-size: 14px;
  font-weight: 400; /* Normal font weight */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; /* Modern sans-serif */
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: ${props => props.isActive ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'}; /* Subtle shadow for active */
  
  &:hover {
    background: ${props => props.isActive ? '#EDF4FF' : '#f9fafb'};
    color: ${props => props.isActive ? '#1E1E1E' : '#374151'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ChipIcon = styled.div<{ isActive: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const modeConfig = {
  all: { label: 'All', icon: <img src="/All.svg" alt="All" width="16" height="16" /> },
  chronology_dol: { label: 'Chronology Sort w DOL', icon: <img src="/view.svg" alt="View" width="16" height="16" /> },
  facility_split: { label: 'Facility Split', icon: <img src="/view.svg" alt="View" width="16" height="16" /> },
  category_sort: { label: 'Category Sort', icon: <img src="/view.svg" alt="View" width="16" height="16" /> },
  category_sort_2025: { label: 'Category Sort 2025', icon: <img src="/view.svg" alt="View" width="16" height="16" /> },
  billing_finances: { label: 'Billing & Finances', icon: <img src="/view.svg" alt="View" width="16" height="16" /> }
};

const TopPanel: React.FC<TopPanelProps> = ({ mode, onModeChange }) => {
  return (
    <TopPanelContainer>
      <TopPanelContent>
        <TitleSection>
          <Title>Timeline</Title>
        </TitleSection>
        
        <ModeChips>
          {Object.entries(modeConfig).map(([modeKey, config]) => (
            <ModeChip
              key={modeKey}
              isActive={mode === modeKey}
              hasIcon={!!config.icon}
              onClick={() => onModeChange(modeKey as Mode)}
              role="button"
              aria-pressed={mode === modeKey}
            >
              {config.icon && (
                <ChipIcon isActive={mode === modeKey}>
                  {config.icon}
                </ChipIcon>
              )}
              {config.label}
            </ModeChip>
          ))}
        </ModeChips>
      </TopPanelContent>
    </TopPanelContainer>
  );
};

export default TopPanel;
