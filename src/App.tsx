import React, { useEffect } from 'react';
import TimelineDashboard from './components/TimelineDashboard';
import { initializeScrollFade } from './utils/scrollFade';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize scroll fade functionality
    initializeScrollFade();
  }, []);

  return (
    <div className="App">
      <TimelineDashboard />
    </div>
  );
}

export default App;