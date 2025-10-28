import React, { useEffect } from 'react';
import TimelineDashboard from './components/TimelineDashboard';
import { initializeScrollFade } from './utils/scrollFade';
import './App.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import './pdf-viewer-overrides.css';
// Design System
import './design-system/tokens/css-vars.css';
import { GlobalStyle } from './design-system/foundations/GlobalStyle';
import { DropdownProvider } from './contexts/DropdownContext';

function App() {
  useEffect(() => {
    // Initialize scroll fade functionality
    initializeScrollFade();
  }, []);

  return (
    <DropdownProvider>
      <GlobalStyle />
      <div className="App">
        <TimelineDashboard />
      </div>
    </DropdownProvider>
  );
}

export default App;