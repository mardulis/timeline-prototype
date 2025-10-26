import React, { useState } from 'react';
import styled from 'styled-components';

interface PulsePageProps {
  onNavigateToTimeline?: () => void;
}

const PulseContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background: white;
`;

const SideNavigation = styled.div`
  width: 240px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  padding: 0;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
`;

const SideNavHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &:active {
    background: #f3f4f6;
  }
`;

const BackArrow = styled.div`
  width: 16px;
  height: 16px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 6px;
    height: 6px;
    border-left: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
  }
`;

const NavItemsContainer = styled.div`
  padding: 24px 0;
  flex: 1;
`;

const NavItem = styled.button<{ active?: boolean }>`
  width: 100%;
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? '#e0f2fe' : 'transparent'};
  color: ${props => props.active ? '#0369a1' : '#374151'};
  text-align: left;
  font-size: 14px;
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: ${props => props.active ? '3px solid #0369a1' : '3px solid transparent'};

  &:hover {
    background: ${props => props.active ? '#e0f2fe' : '#f3f4f6'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  width: 100%;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
`;

const ButtonsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ButtonLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  min-width: 80px;
`;

// Menu Components based on Figma design
const MenuContainer = styled.div`
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 18px;
  padding: 8px;
  width: 100%;
  max-width: 301px;
`;

const MenuSearchField = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin-bottom: 2px;
`;

const SearchIcon = styled.div`
  width: 12.8px;
  height: 12.8px;
  background: #d1d5db;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-family: 'Switzer', sans-serif;
  font-size: 13px;
  color: #9ca3af;
  flex: 1;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const MenuItem = styled.div<{ state?: 'default' | 'hover' | 'selected' | 'disabled' }>`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  
  ${props => {
    switch (props.state) {
      case 'hover':
        return 'background: #f3f4f6;';
      case 'selected':
        return 'background: #e0f2fe; color: #0369a1;';
      case 'disabled':
        return 'opacity: 0.5; cursor: not-allowed;';
      default:
        return 'background: transparent;';
    }
  }}
  
  &:hover {
    ${props => props.state !== 'disabled' && 'background: #f3f4f6;'}
  }
`;

const MenuIcon = styled.div`
  width: 12.8px;
  height: 12.8px;
  background: #1f2937;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
  flex-shrink: 0;
`;

const MenuLabel = styled.span`
  font-family: 'Switzer', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #1f2937;
  line-height: 20px;
  flex: 1;
`;

const MenuShortcut = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
`;

const ShortcutKey = styled.div`
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 4px;
  padding: 0 4px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Switzer', sans-serif;
  font-size: 13px;
  color: #6b7280;
`;

const MenuSeparator = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 8px 16px;
`;

const MenuActionButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Switzer', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #2582ff;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f9ff;
  }
`;

const MenuSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MenuExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MenuExampleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(301px, 1fr));
  gap: 24px;
  width: 100%;
`;

// Button components based on Figma design
const FigmaButton = styled.button<{
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'default' | 'small' | 'xs';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'focus';
}>`
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  ${props => {
    const sizes = {
      default: {
        fontSize: '13px',
        padding: '8px 12px',
        height: '36px',
        borderRadius: '10px',
      },
      small: {
        fontSize: '13px',
        padding: '6px 10px',
        height: '32px',
        borderRadius: '8px',
      },
      xs: {
        fontSize: '12px',
        padding: '6px 8px',
        height: '24px',
        borderRadius: '10px',
      },
    };

    const variants = {
      primary: {
        backgroundColor: props.state === 'disabled' ? '#f3f4f6' : '#2582ff',
        color: props.state === 'disabled' ? '#9ca3af' : 'white',
        border: '1px solid transparent',
      },
      secondary: {
        backgroundColor: props.state === 'disabled' ? '#f3f4f6' : 'white',
        color: props.state === 'disabled' ? '#9ca3af' : '#1f2937',
        border: '1px solid #e5e7eb',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: props.state === 'disabled' ? '#9ca3af' : '#0f172a',
        border: 'none',
      },
    };

    return {
      ...sizes[props.size],
      ...variants[props.variant],
    };
  }}

  &:hover {
    ${props => {
      if (props.state === 'disabled') return '';
      
      switch (props.variant) {
        case 'primary':
          return 'background-color: #1f6ed9;';
        case 'secondary':
          return 'background-color: #f3f4f6;';
        case 'tertiary':
          return 'color: #1f2937;';
        default:
          return '';
      }
    }}
  }

  &:active {
    ${props => {
      if (props.state === 'disabled') return '';
      
      switch (props.variant) {
        case 'primary':
          return 'background-color: #1a5bb3;';
        case 'secondary':
          return 'background-color: #e5e7eb;';
        case 'tertiary':
          return 'color: #1f2937;';
        default:
          return '';
      }
    }}
  }

  &:focus {
    outline: none;
    ${props => {
      if (props.state === 'disabled') return '';
      return `
        box-shadow: 0 0 0 2px rgba(37, 130, 255, 0.3);
      `;
    }}
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const IconButton = styled.button<{
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'medium' | 'small' | 'xs';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'focus';
}>`
  font-family: 'Switzer', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    const sizes = {
      medium: {
        width: '36px',
        height: '36px',
        padding: '10px',
        borderRadius: '10px',
      },
      small: {
        width: '32px',
        height: '32px',
        padding: '8px',
        borderRadius: '8px',
      },
      xs: {
        width: '24px',
        height: '24px',
        padding: '4px',
        borderRadius: '10px',
      },
    };

    const variants = {
      primary: {
        backgroundColor: props.state === 'disabled' ? '#f3f4f6' : '#2582ff',
        color: props.state === 'disabled' ? '#9ca3af' : 'white',
      },
      secondary: {
        backgroundColor: props.state === 'disabled' ? '#f3f4f6' : 'white',
        color: props.state === 'disabled' ? '#d1d5db' : '#1f2937',
        border: '1px solid #e5e7eb',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: props.state === 'disabled' ? '#d1d5db' : '#1f2937',
      },
    };

    return {
      ...sizes[props.size],
      ...variants[props.variant],
    };
  }}

  &:hover {
    ${props => {
      if (props.state === 'disabled') return '';
      
      switch (props.variant) {
        case 'primary':
          return 'background-color: #1f6ed9;';
        case 'secondary':
          return 'background-color: #f3f4f6;';
        case 'tertiary':
          return 'color: #1f2937;';
        default:
          return '';
      }
    }}
  }

  &:focus {
    outline: none;
    ${props => {
      if (props.state === 'disabled') return '';
      return `
        box-shadow: 0 0 0 2px rgba(51, 147, 255, 0.3);
      `;
    }}
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Icon = styled.div`
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
`;

type Section = 'buttons' | 'menu' | 'typography' | 'colors' | 'spacing' | 'components';

const PulsePage: React.FC<PulsePageProps> = ({ onNavigateToTimeline }) => {
  const [activeSection, setActiveSection] = useState<Section>('buttons');

  const renderButtonsSection = () => (
    <>
      <Title>Buttons</Title>
      
      <ButtonsSection>
        <div>
          <SectionTitle>Primary Buttons</SectionTitle>
          <ButtonGroup>
            <ButtonRow>
              <ButtonLabel>Default</ButtonLabel>
              <FigmaButton variant="primary" size="default" state="default">
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="small" state="default">
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="xs" state="default">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Hover</ButtonLabel>
              <FigmaButton variant="primary" size="default" state="hover">
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="small" state="hover">
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="xs" state="hover">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Active</ButtonLabel>
              <FigmaButton variant="primary" size="default" state="active">
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="small" state="active">
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="xs" state="active">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Disabled</ButtonLabel>
              <FigmaButton variant="primary" size="default" state="disabled" disabled>
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="small" state="disabled" disabled>
                Button
              </FigmaButton>
              <FigmaButton variant="primary" size="xs" state="disabled" disabled>
                Button
              </FigmaButton>
            </ButtonRow>
          </ButtonGroup>
        </div>
        
        <div>
          <SectionTitle>Secondary Buttons</SectionTitle>
          <ButtonGroup>
            <ButtonRow>
              <ButtonLabel>Default</ButtonLabel>
              <FigmaButton variant="secondary" size="default" state="default">
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="small" state="default">
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="xs" state="default">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Hover</ButtonLabel>
              <FigmaButton variant="secondary" size="default" state="hover">
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="small" state="hover">
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="xs" state="hover">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Active</ButtonLabel>
              <FigmaButton variant="secondary" size="default" state="active">
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="small" state="active">
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="xs" state="active">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Disabled</ButtonLabel>
              <FigmaButton variant="secondary" size="default" state="disabled" disabled>
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="small" state="disabled" disabled>
                Button
              </FigmaButton>
              <FigmaButton variant="secondary" size="xs" state="disabled" disabled>
                Button
              </FigmaButton>
            </ButtonRow>
          </ButtonGroup>
        </div>
        
        <div>
          <SectionTitle>Tertiary Buttons</SectionTitle>
          <ButtonGroup>
            <ButtonRow>
              <ButtonLabel>Default</ButtonLabel>
              <FigmaButton variant="tertiary" size="default" state="default">
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="small" state="default">
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="xs" state="default">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Hover</ButtonLabel>
              <FigmaButton variant="tertiary" size="default" state="hover">
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="small" state="hover">
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="xs" state="hover">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Active</ButtonLabel>
              <FigmaButton variant="tertiary" size="default" state="active">
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="small" state="active">
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="xs" state="active">
                Button
              </FigmaButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Disabled</ButtonLabel>
              <FigmaButton variant="tertiary" size="default" state="disabled" disabled>
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="small" state="disabled" disabled>
                Button
              </FigmaButton>
              <FigmaButton variant="tertiary" size="xs" state="disabled" disabled>
                Button
              </FigmaButton>
            </ButtonRow>
          </ButtonGroup>
          </div>
      </ButtonsSection>
      
      <ButtonsSection>
        <div>
          <SectionTitle>Icon Buttons</SectionTitle>
          <ButtonGroup>
            <ButtonRow>
              <ButtonLabel>Primary</ButtonLabel>
              <IconButton variant="primary" size="medium" state="default">
                <Icon />
              </IconButton>
              <IconButton variant="primary" size="small" state="default">
                <Icon />
              </IconButton>
              <IconButton variant="primary" size="xs" state="default">
                <Icon />
              </IconButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Secondary</ButtonLabel>
              <IconButton variant="secondary" size="medium" state="default">
                <Icon />
              </IconButton>
              <IconButton variant="secondary" size="small" state="default">
                <Icon />
              </IconButton>
              <IconButton variant="secondary" size="xs" state="default">
                <Icon />
              </IconButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Tertiary</ButtonLabel>
              <IconButton variant="tertiary" size="medium" state="default">
                <Icon />
              </IconButton>
              <IconButton variant="tertiary" size="small" state="default">
                <Icon />
              </IconButton>
              <IconButton variant="tertiary" size="xs" state="default">
                <Icon />
              </IconButton>
            </ButtonRow>
            
            <ButtonRow>
              <ButtonLabel>Disabled</ButtonLabel>
              <IconButton variant="primary" size="medium" state="disabled" disabled>
                <Icon />
              </IconButton>
              <IconButton variant="secondary" size="small" state="disabled" disabled>
                <Icon />
              </IconButton>
              <IconButton variant="tertiary" size="xs" state="disabled" disabled>
                <Icon />
              </IconButton>
            </ButtonRow>
          </ButtonGroup>
          </div>
      </ButtonsSection>
    </>
  );

  const renderMenuSection = () => (
    <MenuSection>
      <Title>Menu Components</Title>
      
      <MenuExample>
        <MenuExampleTitle>Basic Menu</MenuExampleTitle>
        <MenuGrid>
          <MenuContainer>
            <MenuSearchField>
              <SearchIcon />
              <SearchInput placeholder="Search" />
            </MenuSearchField>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Menu Label</MenuLabel>
              <MenuShortcut>
                <ShortcutKey>⌘</ShortcutKey>
                <ShortcutKey>A</ShortcutKey>
              </MenuShortcut>
            </MenuItem>
            
            <MenuItem state="hover">
              <MenuIcon />
              <MenuLabel>Menu Label</MenuLabel>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuItem state="selected">
              <MenuIcon />
              <MenuLabel>Menu Label</MenuLabel>
            </MenuItem>
            
            <MenuItem state="disabled">
              <MenuIcon />
              <MenuLabel>Menu Label</MenuLabel>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuActionButton>Action Button</MenuActionButton>
          </MenuContainer>
          
          <MenuContainer>
            <MenuSearchField>
              <SearchIcon />
              <SearchInput placeholder="Search" />
            </MenuSearchField>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Navigation Menu</MenuLabel>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Context Menu</MenuLabel>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Dropdown Menu</MenuLabel>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Breadcrumb Menu</MenuLabel>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Settings</MenuLabel>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Help & Support</MenuLabel>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuActionButton>Sign Out</MenuActionButton>
          </MenuContainer>
          
          <MenuContainer>
            <MenuSearchField>
              <SearchIcon />
              <SearchInput placeholder="Search" />
            </MenuSearchField>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>New Document</MenuLabel>
              <MenuShortcut>
                <ShortcutKey>⌘</ShortcutKey>
                <ShortcutKey>N</ShortcutKey>
              </MenuShortcut>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Open Document</MenuLabel>
              <MenuShortcut>
                <ShortcutKey>⌘</ShortcutKey>
                <ShortcutKey>O</ShortcutKey>
              </MenuShortcut>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Save Document</MenuLabel>
              <MenuShortcut>
                <ShortcutKey>⌘</ShortcutKey>
                <ShortcutKey>S</ShortcutKey>
              </MenuShortcut>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Export as PDF</MenuLabel>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Print Document</MenuLabel>
              <MenuShortcut>
                <ShortcutKey>⌘</ShortcutKey>
                <ShortcutKey>P</ShortcutKey>
              </MenuShortcut>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Share Document</MenuLabel>
            </MenuItem>
            
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Document Properties</MenuLabel>
            </MenuItem>
            
            <MenuSeparator />
            
            <MenuActionButton>Close Document</MenuActionButton>
          </MenuContainer>
        </MenuGrid>
      </MenuExample>
      
      <MenuExample>
        <MenuExampleTitle>Menu States</MenuExampleTitle>
        <MenuGrid>
          <MenuContainer>
            <MenuItem state="default">
              <MenuIcon />
              <MenuLabel>Default State</MenuLabel>
            </MenuItem>
            
            <MenuItem state="hover">
              <MenuIcon />
              <MenuLabel>Hover State</MenuLabel>
            </MenuItem>
            
            <MenuItem state="selected">
              <MenuIcon />
              <MenuLabel>Selected State</MenuLabel>
            </MenuItem>
            
            <MenuItem state="disabled">
              <MenuIcon />
              <MenuLabel>Disabled State</MenuLabel>
            </MenuItem>
          </MenuContainer>
        </MenuGrid>
      </MenuExample>
    </MenuSection>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'buttons':
        return renderButtonsSection();
      case 'menu':
        return renderMenuSection();
      case 'typography':
        return <div><Title>Typography</Title><p>Typography components coming soon...</p></div>;
      case 'colors':
        return <div><Title>Colors</Title><p>Color palette coming soon...</p></div>;
      case 'spacing':
        return <div><Title>Spacing</Title><p>Spacing system coming soon...</p></div>;
      case 'components':
        return <div><Title>Components</Title><p>Additional components coming soon...</p></div>;
      default:
        return renderButtonsSection();
    }
  };

  return (
    <PulseContainer>
      <SideNavigation>
          <SideNavHeader>
          <BackButton onClick={onNavigateToTimeline}>
            <BackArrow />
            Timeline
          </BackButton>
          </SideNavHeader>
          
        <NavItemsContainer>
                <NavItem
            active={activeSection === 'buttons'} 
            onClick={() => setActiveSection('buttons')}
                >
            Buttons
                </NavItem>
          <NavItem 
            active={activeSection === 'menu'} 
            onClick={() => setActiveSection('menu')}
          >
            Menu
          </NavItem>
          <NavItem 
            active={activeSection === 'typography'} 
            onClick={() => setActiveSection('typography')}
          >
            Typography
          </NavItem>
          <NavItem 
            active={activeSection === 'colors'} 
            onClick={() => setActiveSection('colors')}
          >
            Colors
          </NavItem>
          <NavItem 
            active={activeSection === 'spacing'} 
            onClick={() => setActiveSection('spacing')}
          >
            Spacing
          </NavItem>
          <NavItem 
            active={activeSection === 'components'} 
            onClick={() => setActiveSection('components')}
          >
            Components
          </NavItem>
        </NavItemsContainer>
        </SideNavigation>
        
        <MainContent>
        <Header>
          <PageTitle>Pulse</PageTitle>
        </Header>
        
        <Content>
          {renderContent()}
        </Content>
        </MainContent>
    </PulseContainer>
  );
};

export default PulsePage;