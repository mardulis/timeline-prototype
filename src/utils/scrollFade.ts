/* =========================
   JS: Toggle state classes
   ========================= */

const EPS = 1;

function updateFade(container: HTMLElement) {
  const { scrollTop, scrollHeight, clientHeight } = container;
  const hasOverflow = scrollHeight > clientHeight + EPS;

  container.classList.toggle('has-overflow', hasOverflow);

  if (!hasOverflow) {
    container.classList.remove('at-top', 'at-bottom');
    return;
  }

  container.classList.toggle('at-top', scrollTop <= EPS);
  container.classList.toggle('at-bottom', scrollTop + clientHeight >= scrollHeight - EPS);
}

function init(container: Element) {
  const inner = container.querySelector('.scroll-inner') || container;
  updateFade(container as HTMLElement);

  container.addEventListener('scroll', () => updateFade(container as HTMLElement), { passive: true });

  const ro = new ResizeObserver(() => updateFade(container as HTMLElement));
  ro.observe(container);
  ro.observe(inner);

  const mo = new MutationObserver(() => updateFade(container as HTMLElement));
  mo.observe(inner, { childList: true, subtree: true });
}

export function initializeScrollFade() {
  document.querySelectorAll('.scroll-fade').forEach(init);
}

export function addScrollFadeToElement(element: HTMLElement) {
  element.classList.add('scroll-fade');
  init(element);
}
