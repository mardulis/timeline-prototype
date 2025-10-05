import React from 'react';
import styled from 'styled-components';

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

const LogoContainer = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const LeftSidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo src="/WD logo blue.svg" alt="WD Logo" />
      </LogoContainer>
    </SidebarContainer>
  );
};

export default LeftSidebar;
