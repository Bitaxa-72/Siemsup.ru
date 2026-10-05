(function initProductCarousels(globalScope) {
  const createProductCarouselState = ({ count, getVisible, onChange }) => {
    let index = 0;
    const maxIndex = () => Math.max(0, count - getVisible());
    const select = (nextIndex) => {
      index = Math.max(0, Math.min(nextIndex, maxIndex()));
      onChange(index, maxIndex());
    };
    return { select, next: () => select(index + 1), prev: () => select(index - 1), refresh: () => select(index) };
  };

  const initCarousel = (root) => {
    const viewport = root.querySelector('[data-product-carousel-viewport]');
    const track = root.querySelector('[data-product-carousel-track]');
    const cards = [...track.children];
    const previous = root.querySelector('[data-product-carousel-prev]');
    const next = root.querySelector('[data-product-carousel-next]');
    let pointerStart = null;
    const gap = () => Number.parseFloat(globalScope.getComputedStyle(track).gap) || 14;
    const step = () => cards[0].getBoundingClientRect().width + gap();
    const visible = () => Math.max(1, Math.floor((viewport.clientWidth + gap()) / step()));
    const render = (index, maxIndex) => {
      track.style.transform = `translateX(${-index * step()}px)`;
      previous.disabled = index === 0;
      next.disabled = index === maxIndex;
    };
    const carousel = createProductCarouselState({ count: cards.length, getVisible: visible, onChange: render });
    previous.addEventListener('click', carousel.prev);
    next.addEventListener('click', carousel.next);
    viewport.addEventListener('pointerdown', (event) => { pointerStart = event.clientX; });
    viewport.addEventListener('pointerup', (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) < 45) return;
      distance < 0 ? carousel.next() : carousel.prev();
    });
    viewport.addEventListener('pointercancel', () => { pointerStart = null; });
    globalScope.addEventListener('resize', carousel.refresh);
    globalScope.requestAnimationFrame(carousel.refresh);
    return carousel;
  };

  globalScope.createProductCarouselState = createProductCarouselState;
  if (typeof module !== 'undefined') module.exports = { createProductCarouselState };
  if (typeof document !== 'undefined') document.querySelectorAll('[data-product-carousel]').forEach(initCarousel);
}(typeof window === 'undefined' ? globalThis : window));
