import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoadingContainer = styled.div`
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

const SpinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: ${SpinnerAnimation} 1s linear infinite;
`;

const LoadingText = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const SubText = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin: 0;
`;

export function DataLoadingState() {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Loading your data</LoadingText>
      <SubText>Please wait while we prepare your documents</SubText>
    </LoadingContainer>
  );
}
