import React from 'react';
import styled from 'styled-components';

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #ffffff;
  padding: 40px 20px;
  gap: 24px;
`;

const Illustration = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 128px;
    height: 128px;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const PrimaryText = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const SecondaryText = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #a0a0a0;
  margin: 0;
`;

const ClearFiltersButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <EmptyStateContainer>
      <Illustration>
        <img src="/svg/search_illustration.svg" alt="No search results" />
      </Illustration>
      
      <TextContainer>
        <PrimaryText>No results found</PrimaryText>
        <SecondaryText>No documents match the filters applied</SecondaryText>
      </TextContainer>
      
      <ClearFiltersButton onClick={onClearFilters}>
        Clear filters
      </ClearFiltersButton>
    </EmptyStateContainer>
  );
}
