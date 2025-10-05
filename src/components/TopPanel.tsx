import React, { useRef } from 'react';
import styled from 'styled-components';
import { TopPanelProps, Mode } from '../types/Timeline';

const TopPanelContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  height: 121px;
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
  justify-content: space-between;
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

const ModeChip = styled.button<{ isActive: boolean; hasIcon?: boolean; isClickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.hasIcon ? '8px' : '0px'};
  padding: 8px 16px;
  border-radius: 999px; /* Pill-shaped with high border-radius */
  border: none;
  background: ${props => props.isActive ? '#EDF4FF' : 'transparent'}; /* Light blue background for active */
  color: ${props => props.isActive ? '#1E1E1E' : '#111827'}; /* Primary color for inactive tabs */
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '400'}; /* Strong font weight for active "All" tab */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; /* Modern sans-serif */
  cursor: ${props => props.isClickable ? 'pointer' : 'default'}; /* Only clickable tabs get pointer cursor */
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
    box-shadow: ${props => props.isClickable ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'};
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

const LoadCSVButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #2582FF;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #1a6bcc;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 130, 255, 0.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const modeConfig = {
  all: { label: 'All', icon: <img src="/All.svg" alt="All" width="16" height="16" /> },
  chronology_dol: { label: 'Chronology Sort w DOL', icon: <img src="/View.svg" alt="View" width="16" height="16" /> },
  facility_split: { label: 'Facility Split', icon: <img src="/View.svg" alt="View" width="16" height="16" /> },
  category_sort: { label: 'Category Sort', icon: <img src="/View.svg" alt="View" width="16" height="16" /> },
  category_sort_2025: { label: 'Category Sort 2025', icon: <img src="/View.svg" alt="View" width="16" height="16" /> },
  billing_finances: { label: 'Billing & Finances', icon: <img src="/View.svg" alt="View" width="16" height="16" /> }
};

const TopPanel: React.FC<TopPanelProps> = ({ mode, onModeChange, onLoadCSV }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onLoadCSV) {
      onLoadCSV(file);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModeClick = (modeKey: Mode) => {
    // Only allow clicking on the "All" tab
    if (modeKey === 'all' && onModeChange) {
      onModeChange(modeKey);
    }
  };

  return (
    <TopPanelContainer>
      <TopPanelContent>
        <TitleSection>
          <Title>Timeline</Title>
          <LoadCSVButton onClick={handleLoadCSVClick}>
            Load CSV
          </LoadCSVButton>
        </TitleSection>
        
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
        
        <ModeChips>
          {Object.entries(modeConfig).map(([modeKey, config]) => {
            const isClickable = modeKey === 'all';
            return (
              <ModeChip
                key={modeKey}
                isActive={mode === modeKey}
                hasIcon={!!config.icon}
                isClickable={isClickable}
                onClick={() => handleModeClick(modeKey as Mode)}
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
            );
          })}
        </ModeChips>
      </TopPanelContent>
    </TopPanelContainer>
  );
};

export default TopPanel;
