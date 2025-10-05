import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  background: white;
`;

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  border-radius: 50%;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #111827;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
  color: #6b7280;
`;

const ContactSupportLink = styled.a`
  color: #3b82f6;
  text-decoration: underline;
  font-size: 14px;
  margin-bottom: 24px;
  
  &:hover {
    color: #2563eb;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RefreshIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface CSVErrorStateProps {
  error: string;
  onRefresh: () => void;
}

const CSVErrorState: React.FC<CSVErrorStateProps> = ({ error, onRefresh }) => {
  return (
    <ErrorContainer>
      <ErrorIcon>
        {/* Failed load icon - using a simple warning icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ErrorIcon>
      
      <ErrorTitle>Cases failed to load</ErrorTitle>
      
      <ErrorMessage>
        Try refreshing the page. Contact us if the issue persists.
      </ErrorMessage>
      
      <ContactSupportLink href="#" onClick={(e) => e.preventDefault()}>
        Contact support
      </ContactSupportLink>
      
      <RefreshButton onClick={onRefresh}>
        <RefreshIcon>
          {/* Refresh icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M22.99 14A9 9 0 0 1 18.36 18.36L23 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </RefreshIcon>
        Refresh
      </RefreshButton>
    </ErrorContainer>
  );
};

export default CSVErrorState;
