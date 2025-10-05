/* === JS: Toggle classes based on scroll position === */

const EPS = 1; // tolerance for bottom detection

function updateFade(el: HTMLElement) {
  const { scrollTop, scrollHeight, clientHeight } = el;
  const hasOverflow = scrollHeight > clientHeight + EPS;
  el.classList.toggle("has-overflow", hasOverflow);

  if (!hasOverflow) {
    el.classList.remove("at-top", "at-bottom");
    return;
  }
  el.classList.toggle("at-top", scrollTop <= EPS);
  el.classList.toggle("at-bottom", scrollTop + clientHeight >= scrollHeight - EPS);
}

function initScrollFade(el: HTMLElement) {
  // initial state
  updateFade(el);

  // update on scroll & resize
  el.addEventListener("scroll", () => updateFade(el), { passive: true });
  
  const ro = new ResizeObserver(() => updateFade(el));
  ro.observe(el);

  // If content mutates dynamically
  const mo = new MutationObserver(() => updateFade(el));
  mo.observe(el, { childList: true, subtree: true });
}

export function initializeScrollFade() {
  // Initialize all scroll-fade columns
  document.querySelectorAll(".scroll-fade").forEach((el) => {
    initScrollFade(el as HTMLElement);
  });
}

export function addScrollFadeToElement(element: HTMLElement) {
  element.classList.add("scroll-fade");
  initScrollFade(element);
}
