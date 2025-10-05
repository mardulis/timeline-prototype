import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import ActivityHistogram from './ActivityHistogram';
import YearView from './YearView';
import MonthView from './MonthView';
import DayView from './DayView';
import { CalendarAreaProps, Doc } from '../types/Timeline';

const CalendarContainer = styled.div`
  flex: 1;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative; /* Enable absolute positioning for minimap */
`;

const MinimapSection = styled.div`
  flex-shrink: 0; /* Fixed height, not scrollable */
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20; /* Higher than column headers */
  overflow: visible; /* Ensure minimap content is visible */
`;

const CalendarSection = styled.div`
  flex: 1;
  overflow-x: hidden; /* Let individual views handle horizontal scrolling */
  overflow-y: auto; /* Enable vertical scrolling */
  display: flex;
  flex-direction: column;
  margin-top: 120px; /* Increased space for fixed minimap (was 80px) */
  margin-bottom: 40px; /* Space for fixed footer */
  z-index: 10; /* Below document preview panel (z-index: 35) */
`;

const DocumentFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 64px; /* Start to the right of left navigation panel */
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  font-size: 12px;
  color: #6b7280;
  text-align: left;
  z-index: 15; /* Above calendar content but below minimap */
`;

const CalendarArea: React.FC<CalendarAreaProps> = ({
  scale,
  mode,
  range,
  docs,
  selectedDocId,
  onScaleChange,
  onModeChange,
  onScrub,
  onSelect,
  isPreviewVisible = false,
  currentYear: propCurrentYear = 2021,
  currentMonth: propCurrentMonth = 0,
  currentDay: propCurrentDay = 1,
  onYearChange,
  onMonthChange,
  onDayChange,
  onManualNavigationStart,
  manualNavigationRef
}) => {
  const [currentYear, setCurrentYear] = useState(propCurrentYear);
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth);
  const [currentDay, setCurrentDay] = useState(propCurrentDay);
  const [highlightedMonth, setHighlightedMonth] = useState<{ year: number; month: number } | undefined>();
  const calendarRef = useRef<HTMLDivElement>(null);
  const localManualNavigationRef = useRef(false);
  const isManualNavigationRef = manualNavigationRef || localManualNavigationRef;

  // Sync propCurrentYear with local state
  useEffect(() => {
    setCurrentYear(propCurrentYear);
  }, [propCurrentYear]);

  // Sync propCurrentMonth with local state
  useEffect(() => {
    setCurrentMonth(propCurrentMonth);
  }, [propCurrentMonth]);

  // Sync propCurrentDay with local state
  useEffect(() => {
    setCurrentDay(propCurrentDay);
  }, [propCurrentDay]);

  // Note: Removed automatic scroll reset on year/month changes to prevent jarring resets
  // Users can manually scroll to see different content, and minimap clicks handle navigation

  // Animation tracking for denoising
  const animationRefs = useRef<Map<HTMLElement, number>>(new Map());
  const scrollDebounceRef = useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map());
  
  // Scroll state preservation to prevent interference
  const scrollStateRef = useRef<{
    isMinimapScrolling: boolean;
    lastMinimapScrollTime: number;
    userScrollTimeout: NodeJS.Timeout | null;
  }>({
    isMinimapScrolling: false,
    lastMinimapScrollTime: 0,
    userScrollTimeout: null
  });

  // Enhanced smooth scroll function with denoising and glitch prevention
  const smoothScrollTo = useCallback((element: HTMLElement, targetLeft: number, duration: number = 300) => {
    const startLeft = element.scrollLeft;
    const distance = targetLeft - startLeft;
    
    // Denoising: Only scroll if distance is significant (threshold: 5px)
    const SCROLL_THRESHOLD = 5;
    if (Math.abs(distance) < SCROLL_THRESHOLD) {
      return; // Skip unnecessary micro-movements
    }
    
    // Cancel any existing animation for this element
    const existingAnimationId = animationRefs.current.get(element);
    if (existingAnimationId) {
      cancelAnimationFrame(existingAnimationId);
    }
    
    // Clear any pending debounced scroll for this element
    const existingTimeout = scrollDebounceRef.current.get(element);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Validate target position
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    const clampedTargetLeft = Math.max(0, Math.min(targetLeft, maxScrollLeft));
    
    // If target is already very close to current position, skip animation
    const finalDistance = clampedTargetLeft - startLeft;
    if (Math.abs(finalDistance) < SCROLL_THRESHOLD) {
      return;
    }
    
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const newScrollLeft = startLeft + (finalDistance * easedProgress);
      
      // Prevent glitches by ensuring smooth progression
      const currentScrollLeft = element.scrollLeft;
      const scrollDelta = Math.abs(newScrollLeft - currentScrollLeft);
      
      // Only update if the change is significant enough to avoid micro-jumps
      if (scrollDelta > 0.5 || progress === 1) {
        element.scrollLeft = newScrollLeft;
      }
      
      if (progress < 1) {
        const animationId = requestAnimationFrame(animateScroll);
        animationRefs.current.set(element, animationId);
      } else {
        // Clean up animation reference when complete
        animationRefs.current.delete(element);
        // Ensure final position is exact
        element.scrollLeft = clampedTargetLeft;
      }
    };

    const animationId = requestAnimationFrame(animateScroll);
    animationRefs.current.set(element, animationId);
  }, []);

  // Debounced scroll function to prevent rapid successive calls
  const debouncedSmoothScrollTo = useCallback((element: HTMLElement, targetLeft: number, delay: number = 50) => {
    // Clear existing timeout for this element
    const existingTimeout = scrollDebounceRef.current.get(element);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      smoothScrollTo(element, targetLeft);
      scrollDebounceRef.current.delete(element);
    }, delay);
    
    scrollDebounceRef.current.set(element, timeoutId);
  }, [smoothScrollTo]);

  // Helper function to perform the actual scroll calculation
  const performScrollToKeepVisible = useCallback((selectedDocElement: HTMLElement, scrollableContainer: HTMLElement) => {
    const containerRect = scrollableContainer.getBoundingClientRect();
    const docRect = selectedDocElement.getBoundingClientRect();
    const previewPanelWidth = 620;
    const visibleAreaRight = containerRect.width - previewPanelWidth;
    
    // Enhanced overlap detection: Check both document and its column
    const docColumn = selectedDocElement.closest('[data-year], [data-month], [data-day]') as HTMLElement;
    let isOverlapped = docRect.right > visibleAreaRight;
    
    // Also check if the entire column is overlapped
    if (docColumn) {
      const columnRect = docColumn.getBoundingClientRect();
      const isColumnOverlapped = columnRect.right > visibleAreaRight;
      isOverlapped = isOverlapped || isColumnOverlapped;
    }
    
    if (!isOverlapped) {
      // Document and column are not overlapped, no scrolling needed
      return;
    }
    
    // Calculate the minimum delta scroll needed to keep document visible
    const currentScrollLeft = scrollableContainer.scrollLeft;
    const docLeft = docRect.left - containerRect.left + currentScrollLeft;
    const docRight = docLeft + docRect.width;
    
    // Calculate how much we need to scroll to keep document visible
    const overlapAmount = docRight - visibleAreaRight;
    const deltaScroll = overlapAmount + 40; // Larger margin for view transitions
    
    // Apply delta scroll - no reset, just move the minimum distance
    const newScrollLeft = currentScrollLeft + deltaScroll;
    const maxScrollLeft = scrollableContainer.scrollWidth - containerRect.width;
    const finalScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
    
    // Only scroll if there's actually a change needed
    if (Math.abs(finalScrollLeft - currentScrollLeft) > 5) {
      debouncedSmoothScrollTo(scrollableContainer, finalScrollLeft, 50); // Slightly longer delay for view transitions
    }
  }, [debouncedSmoothScrollTo]);

  const scrollToKeepDocumentVisible = useCallback((docId: string) => {
    if (!calendarRef.current || !isPreviewVisible) return;
    
    // Don't interfere if minimap scrolling is active
    if (scrollStateRef.current.isMinimapScrolling) {
      return;
    }
    
    const scrollableContainer = calendarRef.current.querySelector('.scrollable-grid') as HTMLElement;
    if (!scrollableContainer) return;
    
    // Find the selected document element with retry logic for view transitions
    let selectedDocElement = scrollableContainer.querySelector(`[data-doc-id="${docId}"]`) as HTMLElement;
    
    // If document not found, wait a bit for DOM to update (view transition)
    if (!selectedDocElement) {
      setTimeout(() => {
        selectedDocElement = scrollableContainer.querySelector(`[data-doc-id="${docId}"]`) as HTMLElement;
        if (selectedDocElement) {
          performScrollToKeepVisible(selectedDocElement, scrollableContainer);
        }
      }, 100); // Wait for DOM update
      return;
    }
    
    performScrollToKeepVisible(selectedDocElement, scrollableContainer);
  }, [isPreviewVisible, performScrollToKeepVisible]);


  // SaaS Pattern: Viewport-based positioning (like Linear/Notion)
  // Only scroll if target is completely outside the viewport
  const scrollToDate = useCallback((date: Date, forceScroll: boolean = false) => {
    if (!calendarRef.current) return;
    
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();
    
    // Find the target column based on scale
    let targetSelector = '';
    switch (scale) {
      case 'year':
        targetSelector = `[data-year="${targetYear}"]`;
        break;
      case 'month':
        targetSelector = `[data-month="${targetMonth}"]`;
        break;
      case 'day':
        targetSelector = `[data-day="${targetDay}"]`;
        break;
    }
    
    const targetElement = calendarRef.current.querySelector(targetSelector);
    
    if (targetElement) {
      // Find the scrollable grid container
      let scrollableContainer = calendarRef.current.querySelector('.scrollable-grid');
      
      if (!scrollableContainer) {
        // Fallback: look for any element with overflow-x: auto
        scrollableContainer = calendarRef.current.querySelector('[style*="overflow-x: auto"]');
      }
      
      if (!scrollableContainer) {
        // Another fallback: look for the grid container
        scrollableContainer = targetElement.closest('div[class*="Grid"]');
      }
      
      // Additional fallback: look for any element with overflow-x: auto in the calendar area
      if (!scrollableContainer) {
        scrollableContainer = calendarRef.current.querySelector('div[style*="overflow-x: auto"]');
      }
      
      // Final fallback: look for any scrollable container in the calendar area
      if (!scrollableContainer) {
        const allDivs = Array.from(calendarRef.current.querySelectorAll('div'));
        for (const div of allDivs) {
          const style = window.getComputedStyle(div);
          if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
            scrollableContainer = div;
            break;
          }
        }
      }
      
      if (scrollableContainer) {
        // Get current scroll position and container dimensions
        const currentScrollLeft = scrollableContainer.scrollLeft;
        const containerRect = scrollableContainer.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Calculate target position relative to container
        const targetLeft = targetRect.left - containerRect.left + currentScrollLeft;
        
        // Calculate available width (accounting for preview panel)
        const previewPanelWidth = 620;
        const availableWidth = isPreviewVisible ? containerRect.width - previewPanelWidth : containerRect.width;
        
        // Simple delta-based scrolling: only scroll if target is outside viewport
        const targetRight = targetLeft + targetRect.width;
        const viewportLeft = currentScrollLeft;
        const viewportRight = currentScrollLeft + availableWidth;
        
        const isTargetOutside = targetRight < viewportLeft || targetLeft > viewportRight;
        
        // Only scroll if target is outside viewport or if forced
        if (isTargetOutside || forceScroll) {
          // Calculate delta scroll - minimum distance needed
          let deltaScroll = 0;
          
          if (targetRight < viewportLeft) {
            // Target is to the left, scroll left
            deltaScroll = targetLeft - viewportLeft - 20; // Small margin
          } else if (targetLeft > viewportRight) {
            // Target is to the right, scroll right
            deltaScroll = targetRight - viewportRight + 20; // Small margin
          }
          
          // Apply delta scroll
          const newScrollLeft = currentScrollLeft + deltaScroll;
          const maxScrollLeft = scrollableContainer.scrollWidth - containerRect.width;
          const finalScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
          
          // Only scroll if there's actually a change needed
          if (Math.abs(finalScrollLeft - currentScrollLeft) > 5) {
            debouncedSmoothScrollTo(scrollableContainer as HTMLElement, finalScrollLeft, 30);
          }
        }
      } else {
        // Fallback: use scrollIntoView with precise positioning
        targetElement.scrollIntoView({ 
          behavior: 'auto', 
          block: 'start',
          inline: 'start' // Always scroll to start, never 'nearest'
        });
      }
      
      // Scroll to first document based on scale (immediate execution for faster response)
      switch (scale) {
        case 'year':
          scrollToFirstDocumentInYear(targetYear, targetMonth);
          break;
        case 'month':
          scrollToFirstDocumentInDay(targetYear, targetMonth, targetDay);
          break;
        case 'day':
          scrollToFirstDocumentInDay(targetYear, targetMonth, targetDay);
          break;
      }
    } else {
      // Target element not found
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, isPreviewVisible]); // Dependencies for useCallback

  // Helper function to perform the actual minimap scroll calculation
  const performMinimapScroll = useCallback((targetColumn: HTMLElement, scrollableContainer: HTMLElement, containerRect: DOMRect, currentScrollLeft: number) => {
    const columnRect = targetColumn.getBoundingClientRect();
    const previewPanelWidth = 620;
    const availableWidth = isPreviewVisible ? containerRect.width - previewPanelWidth : containerRect.width;
    
    // Calculate target position relative to container
    const columnLeft = columnRect.left - containerRect.left + currentScrollLeft;
    const columnRight = columnLeft + columnRect.width;
    
    // Determine if we need to scroll
    const isColumnVisible = columnLeft >= 0 && columnRight <= availableWidth;
    
    if (isColumnVisible) {
      // Column is already visible, no scrolling needed
      return;
    }
    
    // Calculate optimal scroll position
    let targetScrollLeft;
    
    if (columnLeft < 0) {
      // Column is to the left, scroll to show it at the start
      targetScrollLeft = columnLeft - 20; // Small margin
    } else if (columnRight > availableWidth) {
      // Column is to the right, scroll to show it at the end
      targetScrollLeft = columnRight - availableWidth + 20; // Small margin
    } else {
      // Column is partially visible, position it optimally
      targetScrollLeft = columnLeft - (availableWidth * 0.2); // 20% from left edge
    }
    
    // Ensure we don't scroll beyond bounds
    const maxScrollLeft = scrollableContainer.scrollWidth - containerRect.width;
    const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
    
    // Only scroll if there's a meaningful change
    if (Math.abs(finalScrollLeft - currentScrollLeft) > 10) {
      debouncedSmoothScrollTo(scrollableContainer, finalScrollLeft, 30);
    }
    
    // Reset minimap scrolling flag after a delay
    setTimeout(() => {
      scrollStateRef.current.isMinimapScrolling = false;
    }, 500);
  }, [isPreviewVisible, debouncedSmoothScrollTo]);

  // Enhanced minimap scrolling with state preservation
  const scrollToColumnWithSmartScroll = useCallback((targetDate: Date, columnSelector: string) => {
    if (!calendarRef.current) return;
    
    const scrollableContainer = calendarRef.current.querySelector('.scrollable-grid') as HTMLElement;
    if (!scrollableContainer) return;
    
    // Mark that we're doing minimap scrolling
    scrollStateRef.current.isMinimapScrolling = true;
    scrollStateRef.current.lastMinimapScrollTime = Date.now();
    
    // Get current scroll state
    const currentScrollLeft = scrollableContainer.scrollLeft;
    const containerRect = scrollableContainer.getBoundingClientRect();
    
    // Find the target column element
    const targetColumn = scrollableContainer.querySelector(columnSelector) as HTMLElement;
    if (!targetColumn) {
      // If target not found, try again after a short delay (for view transitions)
      setTimeout(() => {
        const retryTarget = scrollableContainer.querySelector(columnSelector) as HTMLElement;
        if (retryTarget) {
          performMinimapScroll(retryTarget, scrollableContainer, containerRect, currentScrollLeft);
        }
      }, 100);
      return;
    }
    
    performMinimapScroll(targetColumn, scrollableContainer, containerRect, currentScrollLeft);
  }, [isPreviewVisible, performMinimapScroll]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Cancel all pending animations
      const currentAnimationRefs = animationRefs.current;
      currentAnimationRefs.forEach((animationId) => {
        cancelAnimationFrame(animationId);
      });
      currentAnimationRefs.clear();
      
      // Clear all pending timeouts
      const currentScrollDebounceRef = scrollDebounceRef.current;
      currentScrollDebounceRef.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      currentScrollDebounceRef.clear();
    };
  }, []);

  // SaaS Pattern: Scroll preservation - never reset scroll position when selecting documents
  // Only update date context without triggering scroll animations
  useEffect(() => {
    if (selectedDocId && docs.length > 0 && !isManualNavigationRef.current) {
      const selectedDoc = docs.find(doc => doc.id === selectedDocId);
      if (selectedDoc) {
        const docDate = new Date(selectedDoc.date);
        
        // Update current year/month/day to match the selected document
        const newYear = docDate.getFullYear();
        const newMonth = docDate.getMonth();
        const newDay = docDate.getDate();
        
        setCurrentYear(newYear);
        setCurrentMonth(newMonth);
        setCurrentDay(newDay);
        
        // Notify parent components of the date change
        onYearChange?.(newYear);
        onMonthChange?.(newMonth);
        onDayChange?.(newDay);
        
        // SaaS Pattern: No automatic scrolling on document selection
        // This preserves the user's current scroll position and prevents jarring resets
        // Users can manually scroll to see the selected document if needed
      }
    }
  }, [scale, selectedDocId, docs, onYearChange, onMonthChange, onDayChange, isManualNavigationRef]);


  const handleDocSelect = (doc: Doc) => {
    onSelect?.(doc);
    
    // When a new document is selected, update the date but don't scroll
    const docDate = new Date(doc.date);
    
    // Update current year/month/day to match the selected document
    const newYear = docDate.getFullYear();
    const newMonth = docDate.getMonth();
    const newDay = docDate.getDate();
    
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
    setCurrentDay(newDay);
    
    // Notify parent components of the date change
    onYearChange?.(newYear);
    onMonthChange?.(newMonth);
    onDayChange?.(newDay);
  };

  const handleHistogramBarClick = (date: Date) => {
    isManualNavigationRef.current = true;
    // Update current date based on the clicked date
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
    
    // Scroll to the corresponding time period
    scrollToDate(date);
    onScrub?.(date);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isManualNavigationRef.current = false;
    }, 100);
  };

  const handleScrubberDrag = (date: Date) => {
    isManualNavigationRef.current = true;
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
    scrollToDate(date);
    onScrub?.(date);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isManualNavigationRef.current = false;
    }, 100);
  };

  const scrollToFirstDocumentInYear = (year: number, month?: number) => {
    if (!calendarRef.current) return;
    
    // If month is specified, scroll to that specific month within the year
    if (month !== undefined) {
      // Set highlighted month for visual feedback
      setHighlightedMonth({ year, month });
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedMonth(undefined);
      }, 3000);
      
      // Find documents in the specified year and month
      const monthDocs = docs.filter(doc => {
        const docDate = new Date(doc.date);
        return docDate.getFullYear() === year && docDate.getMonth() === month;
      });
      
      if (monthDocs.length > 0) {
        // First, try to scroll to the month header to show it prominently
        const monthHeader = calendarRef.current.querySelector(`[data-year="${year}"] [data-month="${month}"]`);
        if (monthHeader) {
          // Check if month header is already visible before scrolling
          const headerRect = monthHeader.getBoundingClientRect();
          const containerRect = monthHeader.closest('.scrollable-grid')?.getBoundingClientRect();
          
          if (containerRect) {
            const isHeaderVisible = headerRect.top >= containerRect.top && headerRect.bottom <= containerRect.bottom;
            
            if (!isHeaderVisible) {
              monthHeader.scrollIntoView({ 
                behavior: 'auto', 
                block: 'start', // Scroll to show month header at top
                inline: 'nearest'
              });
            }
          }
        } else {
          // Fallback: scroll to first document if month header not found
          const firstDoc = monthDocs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
          const docElement = calendarRef.current.querySelector(`[data-doc-id="${firstDoc.id}"]`);
          if (docElement) {
            // Check if document is already visible before scrolling
            const docRect = docElement.getBoundingClientRect();
            const containerRect = docElement.closest('.scrollable-grid')?.getBoundingClientRect();
            
            if (containerRect) {
              const isDocVisible = docRect.top >= containerRect.top && docRect.bottom <= containerRect.bottom;
              
              if (!isDocVisible) {
                docElement.scrollIntoView({ 
                  behavior: 'auto', 
                  block: 'start',
                  inline: 'nearest'
                });
              }
            }
          }
        }
      } else {
        // If no documents in the month, scroll to the month header
        const monthHeader = calendarRef.current.querySelector(`[data-year="${year}"] [data-month="${month}"]`);
        if (monthHeader) {
          // Check if month header is already visible before scrolling
          const headerRect = monthHeader.getBoundingClientRect();
          const containerRect = monthHeader.closest('.scrollable-grid')?.getBoundingClientRect();
          
          if (containerRect) {
            const isHeaderVisible = headerRect.top >= containerRect.top && headerRect.bottom <= containerRect.bottom;
            
            if (!isHeaderVisible) {
              monthHeader.scrollIntoView({ 
                behavior: 'auto', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }
        }
      }
      return;
    }
    
    // Fallback: Find documents in the specified year (original behavior)
    const yearDocs = docs.filter(doc => {
      const docDate = new Date(doc.date);
      return docDate.getFullYear() === year;
    });
    
    if (yearDocs.length === 0) return;
    
    // Sort by date and get the first document
    const firstDoc = yearDocs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    // Find the document element and scroll to it
    const docElement = calendarRef.current.querySelector(`[data-doc-id="${firstDoc.id}"]`);
    if (docElement) {
      // For Year view, scroll within the column's DocumentList
      const documentList = docElement.closest('.DocumentList');
      if (documentList) {
        // Scroll the DocumentList to show the document
        docElement.scrollIntoView({ 
          behavior: 'auto', 
          block: 'start', // Scroll to top of the document
          inline: 'nearest'
        });
      } else {
        // Fallback to regular scrollIntoView
        docElement.scrollIntoView({ 
          behavior: 'auto', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  };

  const scrollToFirstDocumentInDay = (year: number, month: number, day: number) => {
    if (!calendarRef.current) return;
    
    // Set highlighted month (for month view) or day (for day view)
    if (scale === 'month') {
      setHighlightedMonth({ year, month });
    } else if (scale === 'day') {
      setHighlightedMonth({ year, month });
    }
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedMonth(undefined);
    }, 3000);
    
    // Find documents in the specified day
    const dayDocs = docs.filter(doc => {
      const docDate = new Date(doc.date);
      return docDate.getFullYear() === year && 
             docDate.getMonth() === month && 
             docDate.getDate() === day;
    });
    
    if (dayDocs.length === 0) return;
    
    // Sort by date and get the first document
    const firstDoc = dayDocs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    // Find the document element and scroll to it
    const docElement = calendarRef.current.querySelector(`[data-doc-id="${firstDoc.id}"]`);
    if (docElement) {
      // Check if document is already visible before scrolling
      const docRect = docElement.getBoundingClientRect();
      const containerRect = docElement.closest('.scrollable-grid')?.getBoundingClientRect();
      
      if (containerRect) {
        const isDocVisible = docRect.top >= containerRect.top && docRect.bottom <= containerRect.bottom;
        
        if (!isDocVisible) {
          docElement.scrollIntoView({ 
            behavior: 'auto', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    }
  };

  // Note: Removed automatic vertical scrolling on document selection
  // Users can manually scroll to see documents, no need to auto-center them

  // Smart scroll when preview panel opens to keep selected document visible
  useEffect(() => {
    if (selectedDocId && isPreviewVisible) {
      // Use a longer delay for view transitions to ensure DOM has fully updated
      const timeoutId = setTimeout(() => {
        scrollToKeepDocumentVisible(selectedDocId);
      }, 150); // Increased delay for view transitions
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDocId, isPreviewVisible, scrollToKeepDocumentVisible]);

  // Additional effect for view transitions (scale changes)
  useEffect(() => {
    if (selectedDocId && isPreviewVisible) {
      // Use an even longer delay for scale changes to ensure new view is fully rendered
      const timeoutId = setTimeout(() => {
        scrollToKeepDocumentVisible(selectedDocId);
      }, 200); // Longer delay for view transitions
      
      return () => clearTimeout(timeoutId);
    }
  }, [scale, selectedDocId, isPreviewVisible, scrollToKeepDocumentVisible]);

  const getDocumentCount = () => {
    switch (scale) {
      case 'year':
        return docs.length;
      case 'month':
        return docs.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate.getFullYear() === currentYear;
        }).length;
      case 'day':
        return docs.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate.getFullYear() === currentYear && docDate.getMonth() === currentMonth;
        }).length;
      default:
        return docs.length;
    }
  };

  const renderView = () => {
    const viewProps = {
      docs,
      selectedDocId,
      onSelect: handleDocSelect,
      onNavigate: (direction: 'prev' | 'next') => {
        // Handle navigation if needed
        console.log(`Navigate ${direction}`);
      },
      highlightedMonth,
      currentYear,
      currentMonth,
      currentDay
    };

    switch (scale) {
      case 'year':
        return <YearView {...viewProps} />;
      case 'month':
        return <MonthView {...viewProps} />;
      case 'day':
        return <DayView {...viewProps} />;
      default:
        return <YearView {...viewProps} />;
    }
  };

  return (
    <CalendarContainer>
      <MinimapSection>
        <ActivityHistogram
          docs={docs}
          selectedDocId={selectedDocId}
          onBarClick={handleHistogramBarClick}
          onScrubberDrag={handleScrubberDrag}
          scale={scale}
          currentYear={currentYear}
          currentMonth={currentMonth}
          isPreviewVisible={isPreviewVisible}
          onYearClick={(year) => {
            isManualNavigationRef.current = true;
            setCurrentYear(year);
            // Scroll to the year column with smart scrolling
            const targetDate = new Date(year, 0, 1); // January 1st of the target year
            scrollToColumnWithSmartScroll(targetDate, `[data-year="${year}"]`);
            
            // Reset the flag immediately for faster response
            isManualNavigationRef.current = false;
          }}
          onMonthClick={(month) => {
            isManualNavigationRef.current = true;
            setCurrentMonth(month);
            // Scroll to the month column with smart scrolling
            const targetDate = new Date(currentYear, month, 1);
            scrollToColumnWithSmartScroll(targetDate, `[data-month="${month}"]`);
            
    // Reset the flag immediately for faster response
    isManualNavigationRef.current = false;
          }}
          onDayClick={(day) => {
            isManualNavigationRef.current = true;
            setCurrentDay(day);
            // Scroll to the day column with smart scrolling
            const targetDate = new Date(currentYear, currentMonth, day);
            scrollToColumnWithSmartScroll(targetDate, `[data-day="${day}"]`);
            
    // Reset the flag immediately for faster response
    isManualNavigationRef.current = false;
          }}
        />
      </MinimapSection>
      <CalendarSection ref={calendarRef}>
        {renderView()}
      </CalendarSection>
      <DocumentFooter>
        Showing {getDocumentCount()} Documents ({Math.floor(getDocumentCount() * 3.8)} pages)
      </DocumentFooter>
    </CalendarContainer>
  );
};

export default CalendarArea;
