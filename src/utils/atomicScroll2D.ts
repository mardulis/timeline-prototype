// utils/atomicScroll2D.ts

// Find scrollable ancestors; you'll likely hardcode the 2 containers instead.
export function getScrollableAncestors(el: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = [];
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const isScrollable =
      /(auto|scroll)/.test(style.overflowX) || /(auto|scroll)/.test(style.overflowY);
    if (isScrollable) result.push(node);
    node = node.parentElement;
  }
  return result;
}

function clamp(n: number, a: number, b: number) { 
  return Math.max(a, Math.min(b, n)); 
}

export function computeScrollOffsets2D(opts: {
  container: HTMLElement;           // the scroll container on a given axis
  target: HTMLElement;              // selected item
  axis: 'x' | 'y';
  margin?: number;
  rightOcclusionPx?: number;        // only for axis 'x'
}): number {
  const { container, target, axis, margin = 12, rightOcclusionPx = 0 } = opts;
  const cRect = container.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();

  if (axis === 'x') {
    const usableLeft = cRect.left + margin;
    const usableRight = cRect.left + container.clientWidth - rightOcclusionPx - margin;

    let desiredLeft = container.scrollLeft;
    if (tRect.right > usableRight) {
      desiredLeft += (tRect.right - usableRight);
    } else if (tRect.left < usableLeft) {
      desiredLeft -= (usableLeft - tRect.left);
    }
    const maxLeft = container.scrollWidth - container.clientWidth;
    return clamp(Math.round(desiredLeft), 0, Math.max(0, maxLeft));
  } else {
    // For vertical scrolling, use offsetTop relative to the container
    const targetOffsetTop = target.offsetTop;
    const containerHeight = container.clientHeight;
    const targetHeight = target.offsetHeight;
    
    // Calculate desired scroll position to center the target
    const desiredTop = targetOffsetTop - (containerHeight / 2) + (targetHeight / 2);
    
    const maxTop = container.scrollHeight - container.clientHeight;
    return clamp(Math.round(desiredTop), 0, Math.max(0, maxTop));
  }
}

// Atomic 2D scroll: apply horizontal + vertical in the same frame
export function scrollSelectedIntoView2D(opts: {
  hContainer: HTMLElement;      // horizontal scroller (days/weeks strip)
  vContainer: HTMLElement;      // vertical scroller (column list)
  target: HTMLElement;          // selected item
  rightOcclusionPx?: number;    // width of preview panel if open
  behavior?: ScrollBehavior;    // 'auto' | 'smooth'
}) {
  const { hContainer, vContainer, target, rightOcclusionPx = 0, behavior = 'smooth' } = opts;

  console.log('Atomic 2D scroll calculation:', {
    hContainer: {
      clientWidth: hContainer.clientWidth,
      scrollLeft: hContainer.scrollLeft,
      scrollWidth: hContainer.scrollWidth
    },
    vContainer: {
      clientHeight: vContainer.clientHeight,
      scrollTop: vContainer.scrollTop,
      scrollHeight: vContainer.scrollHeight
    },
    target: {
      rect: target.getBoundingClientRect(),
      offsetTop: target.offsetTop,
      offsetLeft: target.offsetLeft
    },
    rightOcclusionPx
  });

  const left = computeScrollOffsets2D({
    container: hContainer, target, axis: 'x', rightOcclusionPx,
  });
  const top = computeScrollOffsets2D({
    container: vContainer, target, axis: 'y',
  });

  console.log('Computed scroll positions:', { 
    left, 
    top,
    currentHScroll: hContainer.scrollLeft,
    currentVScroll: vContainer.scrollTop,
    willScrollH: left !== hContainer.scrollLeft,
    willScrollV: top !== vContainer.scrollTop
  });

  // Apply both in one rAF to prevent fighting animations
  requestAnimationFrame(() => {
    console.log('Applying atomic scroll:', { left, top, behavior });
    // If behavior is 'smooth', start both simultaneously
    hContainer.scrollTo({ left, behavior });
    vContainer.scrollTo({ top, behavior });
  });
}
