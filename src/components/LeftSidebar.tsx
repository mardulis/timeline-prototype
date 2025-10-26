import React from 'react';
import styled from 'styled-components';

interface LeftSidebarProps {
  onNavigateToPulse?: () => void;
}

const SidebarContainer = styled.div`
  width: 64px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const LogoContainer = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  &:active {
    background: #e5e7eb;
  }
`;

const Logo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onNavigateToPulse }) => {
  return (
    <SidebarContainer>
      <LogoContainer onClick={onNavigateToPulse} title="Pulse">
        <Logo src="/svg/WD logo blue.svg" alt="WD Logo" />
      </LogoContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
