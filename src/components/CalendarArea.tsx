import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ActivityHistogram from './ActivityHistogram';
import YearView from './YearView';
import MonthView from './MonthView';
import DayView from './DayView';
import { CalendarAreaProps, Doc } from '../types/Timeline';
import { computeRightOcclusionPx } from '../utils/scrollIntoViewOcclusionSafe';
import { useSearch } from '../features/search/SearchCtx';
import { filterDocumentsByViewMode } from '../utils/viewModeHelpers';

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
  margin-top: 94px; /* Space for fixed minimap + gap (minimap: 16+32+8+20+6=82px, gap: 12px) */
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
  viewMode = 'titles',
  range,
  docs: originalDocs, // Rename to originalDocs to avoid confusion
  selectedDocId,
  onScaleChange,
  onModeChange,
  onScrub,
  onSelect,
  isPreviewVisible = false,
  currentYear: propCurrentYear = 2021,
  currentMonth: propCurrentMonth = 0,
  currentDay: propCurrentDay = 1,
  highlightedDate,
  onYearChange,
  onMonthChange,
  onDayChange,
  onManualNavigationStart,
  manualNavigationRef,
  scrollToDateRef,
  onHighlightedDate
}) => {
  // Use filtered results from search context
  const { results: searchFilteredDocs } = useSearch();
  
  // Apply viewMode filtering on top of search filtering
  const docs = useMemo(() => 
    filterDocumentsByViewMode(searchFilteredDocs, viewMode), 
    [searchFilteredDocs, viewMode]
  );
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

  // Atomic 2D scroll function - handles both horizontal-only and horizontal+vertical scrolling
  const performScrollToKeepVisible = useCallback((selectedDocElement: HTMLElement, scrollableContainer: HTMLElement) => {
    console.log('Using atomic scroll - checking for DocumentList');
    
    // Find the vertical scroll container (DocumentList)
    const vContainer = selectedDocElement.closest('.DocumentList') as HTMLElement;
    
    console.log('DocumentList detection:', {
      selectedDocElement: selectedDocElement,
      vContainer: vContainer,
      docId: selectedDocElement.getAttribute('data-doc-id'),
      docClasses: selectedDocElement.className
    });
    
    // Compute the right occlusion (preview panel width)
    const rightOcclusionPx = computeRightOcclusionPx(scrollableContainer);
    
    if (vContainer) {
      console.log('DocumentList found - using horizontal scroll + scrollIntoView for vertical (minimap approach)');
      
      // First, handle horizontal scrolling manually
      const cRect = scrollableContainer.getBoundingClientRect();
      const tRect = selectedDocElement.getBoundingClientRect();
      
      const usableLeft = cRect.left + 12;
      const usableRight = cRect.left + scrollableContainer.clientWidth - rightOcclusionPx - 12;
      
      let deltaX = 0;
      if (tRect.right > usableRight) {
        deltaX = (tRect.right - usableRight);
      } else if (tRect.left < usableLeft) {
        deltaX = -(usableLeft - tRect.left);
      }
      
      if (deltaX !== 0) {
        console.log('Horizontal scroll:', { deltaX, rightOcclusionPx });
        scrollableContainer.scrollTo({
          left: scrollableContainer.scrollLeft + deltaX,
          behavior: 'smooth'
        });
      }
      
      // Then, handle vertical scrolling using scrollIntoView (same as minimap)
      setTimeout(() => {
        console.log('Using scrollIntoView for vertical scrolling (minimap approach)');
        
        // Check if document is already visible vertically before scrolling
        const docRect = selectedDocElement.getBoundingClientRect();
        const listRect = vContainer.getBoundingClientRect();
        const isDocVisibleVertically = docRect.top >= listRect.top && docRect.bottom <= listRect.bottom;
        
        console.log('Vertical visibility check:', {
          docRect: { top: docRect.top, bottom: docRect.bottom },
          listRect: { top: listRect.top, bottom: listRect.bottom },
          isDocVisibleVertically,
          vContainerScrollTop: vContainer.scrollTop,
          vContainerScrollHeight: vContainer.scrollHeight,
          vContainerClientHeight: vContainer.clientHeight
        });
        
        if (!isDocVisibleVertically) {
          console.log('Document not visible vertically, calling scrollIntoView');
          selectedDocElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start', // Use 'start' like minimap does
            inline: 'nearest'
          });
        } else {
          console.log('Document already visible vertically, no scroll needed');
        }
      }, 100); // Longer delay to let horizontal scroll complete
    } else {
      console.log('No DocumentList found - using horizontal-only scroll');
      
      // Fallback to horizontal-only scrolling (for document preview panel case)
      const cRect = scrollableContainer.getBoundingClientRect();
      const tRect = selectedDocElement.getBoundingClientRect();
      
      const usableLeft = cRect.left + 12;
      const usableRight = cRect.left + scrollableContainer.clientWidth - rightOcclusionPx - 12;
      
      let deltaX = 0;
      if (tRect.right > usableRight) {
        deltaX = (tRect.right - usableRight);
      } else if (tRect.left < usableLeft) {
        deltaX = -(usableLeft - tRect.left);
      }
      
      if (deltaX !== 0) {
        console.log('Horizontal-only scroll:', { deltaX, rightOcclusionPx });
        scrollableContainer.scrollTo({
          left: scrollableContainer.scrollLeft + deltaX,
          behavior: 'smooth'
        });
      } else {
        console.log('Document already visible horizontally');
      }
    }
  }, []);

  const scrollToKeepDocumentVisible = useCallback((docId: string) => {
    if (!calendarRef.current) {
      console.log('ScrollToKeepDocumentVisible: Early return - no calendarRef');
      return;
    }
    
    // Don't interfere if minimap scrolling is active
    if (scrollStateRef.current.isMinimapScrolling) {
      console.log('ScrollToKeepDocumentVisible: Minimap scrolling active, skipping');
      return;
    }
    
    console.log('ScrollToKeepDocumentVisible: Starting scroll check for doc:', docId);
    
    const scrollableContainer = calendarRef.current.querySelector('.scrollable-grid') as HTMLElement;
    if (!scrollableContainer) {
      console.warn('Scrollable container not found for document visibility check');
      return;
    }
    
    // Find the selected document element with retry logic for view transitions
    let selectedDocElement = scrollableContainer.querySelector(`[data-doc-id="${docId}"]`) as HTMLElement;
    
    // If document not found, wait a bit for DOM to update (view transition)
    if (!selectedDocElement) {
      console.log('Document element not found, retrying in 100ms...');
      setTimeout(() => {
        selectedDocElement = scrollableContainer.querySelector(`[data-doc-id="${docId}"]`) as HTMLElement;
        if (selectedDocElement) {
          console.log('Document element found on retry, proceeding with scroll check');
          performScrollToKeepVisible(selectedDocElement, scrollableContainer);
        } else {
          console.warn(`Document element not found for ID: ${docId}`);
        }
      }, 100); // Wait for DOM update
      return;
    }
    
    console.log('Document element found, proceeding with scroll check');
    performScrollToKeepVisible(selectedDocElement, scrollableContainer);
  }, [performScrollToKeepVisible]);


  // SaaS Pattern: Viewport-based positioning (like Linear/Notion)
  // Only scroll if target is completely outside the viewport
  // Helper functions for deterministic 2D scrolling
  const getVerticalScrollParent = (el: HTMLElement | null): HTMLElement | null => {
    let n: HTMLElement | null = el?.parentElement ?? null;
    while (n) {
      const cs = getComputedStyle(n);
      const yScrollable = /(auto|scroll)/.test(cs.overflowY);
      if (yScrollable) return n;
      n = n.parentElement;
    }
    return null;
  };

  const waitForElement = async (selector: string, {
    timeoutMs = 2000,
    mustBeVisibleInDOM = true,
  }: { timeoutMs?: number; mustBeVisibleInDOM?: boolean } = {}): Promise<HTMLElement | null> => {
    const start = performance.now();
    return new Promise(resolve => {
      const tick = () => {
        const el = document.querySelector<HTMLElement>(selector);
        const ready =
          el &&
          (!mustBeVisibleInDOM || (el.offsetParent !== null && el.getBoundingClientRect().height > 0));
        if (ready) return resolve(el!);
        if (performance.now() - start > timeoutMs) return resolve(null);
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  const clamp = (n: number, a: number, b: number) => { return Math.max(a, Math.min(b, n)); };

  const computeTargetLeft = ({
    hContainer, target, rightOcclusionPx = 0, margin = 12,
  }: { hContainer: HTMLElement; target: HTMLElement; rightOcclusionPx?: number; margin?: number }): number => {
    const c = hContainer.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const usableLeft = c.left + margin;
    const usableRight = c.left + hContainer.clientWidth - rightOcclusionPx - margin;

    let desiredLeft = hContainer.scrollLeft;
    if (t.right > usableRight) desiredLeft += (t.right - usableRight);
    else if (t.left < usableLeft) desiredLeft -= (usableLeft - t.left);

    const maxLeft = Math.max(0, hContainer.scrollWidth - hContainer.clientWidth);
    return clamp(Math.round(desiredLeft), 0, maxLeft);
  };

  const computeTargetTop = ({
    vContainer, target, margin = 8,
  }: { vContainer: HTMLElement; target: HTMLElement; margin?: number }): number => {
    const c = vContainer.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    let desiredTop = vContainer.scrollTop;
    const topEdge = c.top + margin;
    const bottomEdge = c.top + vContainer.clientHeight - margin;

    if (t.bottom > bottomEdge) desiredTop += (t.bottom - bottomEdge);
    else if (t.top < topEdge) desiredTop -= (topEdge - t.top);

    const maxTop = Math.max(0, vContainer.scrollHeight - vContainer.clientHeight);
    return clamp(Math.round(desiredTop), 0, maxTop);
  };

  const scrollIntoView2D = ({
    hContainer, vContainer, target, rightOcclusionPx = 0, behavior = 'auto',
  }: {
    hContainer: HTMLElement;
    vContainer: HTMLElement;
    target: HTMLElement;
    rightOcclusionPx?: number;
    behavior?: ScrollBehavior;
  }) => {
    const left = computeTargetLeft({ hContainer, target, rightOcclusionPx });
    const top = computeTargetTop({ vContainer, target });

    console.log('Atomic 2D scroll:', { left, top, behavior, rightOcclusionPx });

    requestAnimationFrame(() => {
      // Start both simultaneously so animations don't fight
      hContainer.scrollTo({ left, behavior });
      vContainer.scrollTo({ top, behavior });
    });
  };

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
    
    console.log('scrollToDate horizontal scroll check:', {
      targetSelector,
      targetElement: targetElement,
      scale,
      date: date.toISOString()
    });
    
    if (targetElement) {
      // Find the scrollable grid container
      let scrollableContainer = calendarRef.current.querySelector('.scrollable-grid');
      
      console.log('Scrollable container detection:', {
        primary: scrollableContainer,
        targetElement: targetElement
      });
      
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
        
        console.log('Horizontal scroll calculation:', {
          currentScrollLeft,
          containerRect: { width: containerRect.width, left: containerRect.left },
          targetRect: { width: targetRect.width, left: targetRect.left },
          isPreviewVisible
        });
        
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
        
        console.log('Horizontal scroll decision:', {
          targetLeft,
          targetRight,
          viewportLeft,
          viewportRight,
          availableWidth,
          isTargetOutside,
          forceScroll
        });
        
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
      // Skip vertical scrolling for year view to maintain user's scroll position
      switch (scale) {
        case 'year':
          // Only horizontal scrolling and highlighting for year view
          // Vertical scroll removed to preserve user's position
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

  // Expose scrollToDate function through ref
  useEffect(() => {
    if (scrollToDateRef) {
      scrollToDateRef.current = scrollToDate;
    }
  }, [scrollToDateRef, scrollToDate]);

  // Helper function to perform the actual minimap scroll calculation
  const performMinimapScroll = useCallback((targetColumn: HTMLElement, scrollableContainer: HTMLElement, containerRect: DOMRect, currentScrollLeft: number) => {
    const previewPanelWidth = 620;
    const availableWidth = isPreviewVisible ? containerRect.width - previewPanelWidth : containerRect.width;
    
    // Get the column's position within the scrollable content
    const columnOffsetLeft = targetColumn.offsetLeft;
    const columnWidth = targetColumn.offsetWidth;
    
    // Calculate the column's position relative to the current scroll position
    const columnLeft = columnOffsetLeft - currentScrollLeft;
    const columnRight = columnLeft + columnWidth;
    
    // Determine if we need to scroll
    const isColumnVisible = columnLeft >= 0 && columnRight <= availableWidth;
    
    if (isColumnVisible) {
      // Column is already visible, no scrolling needed
      return;
    }
    
    // Calculate optimal scroll position
    let targetScrollLeft;
    
    if (columnLeft < 0) {
      // Column is to the left, scroll to show it at the start with margin
      targetScrollLeft = columnOffsetLeft - 20; // Small margin from left edge
    } else if (columnRight > availableWidth) {
      // Column is to the right, scroll to show it at the end with margin
      targetScrollLeft = columnOffsetLeft + columnWidth - availableWidth + 20; // Small margin from right edge
    } else {
      // Column is partially visible, position it optimally
      targetScrollLeft = columnOffsetLeft - (availableWidth * 0.2); // 20% from left edge
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
  }, [performMinimapScroll]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup animations on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      // Cancel all pending animations
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentAnimationRefs = animationRefs.current;
      currentAnimationRefs.forEach((animationId) => {
        cancelAnimationFrame(animationId);
      });
      currentAnimationRefs.clear();
      
      // Clear all pending timeouts
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentScrollDebounceRef = scrollDebounceRef.current;
      currentScrollDebounceRef.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      currentScrollDebounceRef.clear();
    };
  }, []);

  // Track previous timeframe values to detect changes
  // const prevTimeframeRef = useRef({ year: currentYear, month: currentMonth, day: currentDay });

  // Deterministic 2D scrolling after timeframe changes
  useEffect(() => {
    if (!selectedDocId || isManualNavigationRef.current) return;

    console.log('Deterministic 2D scroll effect triggered for:', selectedDocId);

    // Wait until the new view actually renders the selected item
    (async () => {
      // Ensure horizontal container exists
      const hContainer = calendarRef.current?.querySelector<HTMLElement>('.scrollable-grid');
      if (!hContainer) {
        console.log('No horizontal container found');
        return;
      }

      console.log('Horizontal container found:', hContainer);

      // Wait for the selected item in the new view DOM
      const target = await waitForElement(`[data-doc-id="${selectedDocId}"]`);
      if (!target) {
        console.log('Selected item not found after waiting');
        return;
      }

      console.log('Selected item found:', target);

      // Find the correct vertical container for THIS item (column list)
      const vContainer = getVerticalScrollParent(target);
      if (!vContainer) {
        console.log('No vertical container found for selected item');
        return;
      }

      console.log('Vertical container found:', vContainer);

      // If a preview panel is visible, subtract its width from usable right
      const panel = document.querySelector<HTMLElement>('[data-preview-panel]');
      const rightOcclusionPx = panel ? panel.getBoundingClientRect().width : 0;

      console.log('Preview panel occlusion:', rightOcclusionPx);

      // First pass: 'auto' to land deterministically on first paint
      scrollIntoView2D({ hContainer, vContainer, target, rightOcclusionPx, behavior: 'auto' });

      // Optional: tiny smooth nudge after fonts/row-heights settle
      setTimeout(() => {
        scrollIntoView2D({ hContainer, vContainer, target, rightOcclusionPx, behavior: 'smooth' });
      }, 40);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, selectedDocId]);


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
    
    // Trigger highlighting for the clicked date
    onHighlightedDate?.(date);
    setTimeout(() => {
      onHighlightedDate?.(null); // Clear highlight after timeout
    }, 2000); // 2000ms highlight duration
    
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
    
    console.log('scrollToFirstDocumentInYear called:', { year, month, scale });
    
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
              console.log('Scrolling to month header:', monthHeader);
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
                console.log('Scrolling to document element:', docElement);
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
        console.log('Scrolling DocumentList to show document:', docElement);
        docElement.scrollIntoView({ 
          behavior: 'auto', 
          block: 'start', // Scroll to top of the document
          inline: 'nearest'
        });
      } else {
        // Fallback to regular scrollIntoView
        console.log('DocumentList not found, falling back to regular scrollIntoView for document:', docElement);
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
      viewMode,
      selectedDocId,
      onSelect: handleDocSelect,
      onNavigate: (direction: 'prev' | 'next') => {
        // Handle navigation if needed
        console.log(`Navigate ${direction}`);
      },
      highlightedMonth,
      highlightedDate,
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
          onScaleChange={onScaleChange}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
          onYearClick={(year) => {
            isManualNavigationRef.current = true;
            setCurrentYear(year);
            
            // Trigger highlighting for the clicked year (January 1st of that year)
            const highlightDate = new Date(year, 0, 1);
            onHighlightedDate?.(highlightDate);
            setTimeout(() => {
              onHighlightedDate?.(null); // Clear highlight after timeout
            }, 2000); // 2000ms highlight duration
            
            // Scroll to the year column with smart scrolling
            const targetDate = new Date(year, 0, 1); // January 1st of the target year
            scrollToColumnWithSmartScroll(targetDate, `[data-year="${year}"]`);
            
            // Reset the flag after a delay to allow scrolling to complete
            setTimeout(() => {
              isManualNavigationRef.current = false;
            }, 200);
          }}
          onMonthClick={(month) => {
            isManualNavigationRef.current = true;
            setCurrentMonth(month);
            
            // Trigger highlighting for the clicked month (1st day of that month)
            const highlightDate = new Date(currentYear, month, 1);
            onHighlightedDate?.(highlightDate);
            setTimeout(() => {
              onHighlightedDate?.(null); // Clear highlight after timeout
            }, 2000); // 2000ms highlight duration
            
            // Scroll to the month column with smart scrolling
            const targetDate = new Date(currentYear, month, 1);
            scrollToColumnWithSmartScroll(targetDate, `[data-month="${month}"]`);
            
            // Reset the flag after a delay to allow scrolling to complete
            setTimeout(() => {
              isManualNavigationRef.current = false;
            }, 200);
          }}
          onDayClick={(day) => {
            isManualNavigationRef.current = true;
            setCurrentDay(day);
            
            // Trigger highlighting for the clicked day
            const highlightDate = new Date(currentYear, currentMonth, day);
            onHighlightedDate?.(highlightDate);
            setTimeout(() => {
              onHighlightedDate?.(null); // Clear highlight after timeout
            }, 2000); // 2000ms highlight duration
            
            // Scroll to the day column with smart scrolling
            const targetDate = new Date(currentYear, currentMonth, day);
            scrollToColumnWithSmartScroll(targetDate, `[data-day="${day}"]`);
            
            // Reset the flag after a delay to allow scrolling to complete
            setTimeout(() => {
              isManualNavigationRef.current = false;
            }, 200);
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
