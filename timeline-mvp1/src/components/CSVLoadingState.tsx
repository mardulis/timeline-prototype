import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  background: white;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #111827;
`;

const LoadingMessage = styled.p`
  font-size: 14px;
  margin: 0;
  color: #6b7280;
`;

const CSVLoadingState: React.FC = () => {
  return (
    <LoadingContainer>
      <LoadingSpinner />
      <LoadingTitle>Loading CSV file...</LoadingTitle>
      <LoadingMessage>Please wait while we process your data</LoadingMessage>
    </LoadingContainer>
  );
};

export default CSVLoadingState;
