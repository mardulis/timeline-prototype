// utils/scrollIntoViewOcclusionSafe.ts
export function ensureHorizVisibleWithRightOcclusion(opts: {
  container: HTMLElement;
  target: HTMLElement;
  rightOcclusionPx: number; // preview panel width or 0
  margin?: number;          // extra breathing room
  leftPaddingPx?: number;
  rightPaddingPx?: number;
  behavior?: ScrollBehavior; // "smooth" | "auto"
}) {
  const {
    container, target, rightOcclusionPx,
    margin = 8, leftPaddingPx = 8, rightPaddingPx = 8,
    behavior = "smooth",
  } = opts;

  const cRect = container.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();

  const usableLeft  = cRect.left + leftPaddingPx;
  const usableRight = cRect.left + container.clientWidth - rightOcclusionPx - rightPaddingPx;

  // If target is larger than the usable width, prefer showing its left edge
  const usableWidth = Math.max(0, usableRight - usableLeft);
  const targetWidth = tRect.width;

  let delta = 0;

  if (targetWidth > usableWidth) {
    // align left
    delta = (tRect.left - margin) - usableLeft;
  } else if (tRect.right > usableRight - margin) {
    delta = (tRect.right + margin) - usableRight;
  } else if (tRect.left < usableLeft + margin) {
    delta = (tRect.left - margin) - usableLeft;
  }

  if (delta !== 0) {
    // Convert from viewport delta to scrollLeft delta
    container.scrollTo({
      left: container.scrollLeft + delta,
      behavior,
    });
  }
}

export function ensureFullyVisibleWithOcclusion(opts: {
  container: HTMLElement;
  target: HTMLElement;
  rightOcclusionPx: number; // preview panel width or 0
  margin?: number;          // extra breathing room
  leftPaddingPx?: number;
  rightPaddingPx?: number;
  topPaddingPx?: number;
  bottomPaddingPx?: number;
  behavior?: ScrollBehavior; // "smooth" | "auto"
}) {
  const {
    container, target, rightOcclusionPx,
    margin = 8, leftPaddingPx = 8, rightPaddingPx = 8,
    topPaddingPx = 8, bottomPaddingPx = 8,
    behavior = "smooth",
  } = opts;

  const cRect = container.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();

  // Calculate usable bounds
  const usableLeft  = cRect.left + leftPaddingPx;
  const usableRight = cRect.left + container.clientWidth - rightOcclusionPx - rightPaddingPx;
  const usableTop = cRect.top + topPaddingPx;
  const usableBottom = cRect.top + container.clientHeight - bottomPaddingPx;

  // Calculate deltas for both horizontal and vertical scrolling
  let deltaX = 0;
  let deltaY = 0;

  // Horizontal scrolling logic
  const usableWidth = Math.max(0, usableRight - usableLeft);
  const targetWidth = tRect.width;

  if (targetWidth > usableWidth) {
    // Target is wider than usable area, align left
    deltaX = (tRect.left - margin) - usableLeft;
  } else if (tRect.right > usableRight - margin) {
    // Target extends beyond right edge
    deltaX = (tRect.right + margin) - usableRight;
  } else if (tRect.left < usableLeft + margin) {
    // Target extends beyond left edge
    deltaX = (tRect.left - margin) - usableLeft;
  }

  // Vertical scrolling logic
  const usableHeight = Math.max(0, usableBottom - usableTop);
  const targetHeight = tRect.height;

  if (targetHeight > usableHeight) {
    // Target is taller than usable area, align top
    deltaY = (tRect.top - margin) - usableTop;
  } else if (tRect.bottom > usableBottom - margin) {
    // Target extends beyond bottom edge
    deltaY = (tRect.bottom + margin) - usableBottom;
  } else if (tRect.top < usableTop + margin) {
    // Target extends beyond top edge
    deltaY = (tRect.top - margin) - usableTop;
  }

  // Apply scrolling if needed
  if (deltaX !== 0 || deltaY !== 0) {
    container.scrollTo({
      left: container.scrollLeft + deltaX,
      top: container.scrollTop + deltaY,
      behavior,
    });
  }
}

export function computeRightOcclusionPx(container: HTMLElement): number {
  const cRect = container.getBoundingClientRect();
  const panels = Array.from(document.querySelectorAll('[data-preview-panel]')) as HTMLElement[];
  const overlap = panels
    .map(p => {
      const r = p.getBoundingClientRect();
      // overlap amount between panel and container on the X axis
      return Math.max(0, (cRect.right - r.left));
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return Math.min(overlap, container.clientWidth);
}
