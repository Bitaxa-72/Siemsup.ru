(function exposeProductGallery(globalScope) {
  const shouldGalleryPause = ({ reducedMotion, documentHidden }) => reducedMotion || documentHidden;

  const createProductGalleryState = ({
    count,
    onChange,
    delay = 6000,
    schedule = setTimeout,
    cancel = clearTimeout,
  }) => {
    let index = 0;
    let timer = null;
    const stop = () => {
      if (timer !== null) cancel(timer);
      timer = null;
    };
    const queue = () => {
      stop();
      timer = schedule(() => {
        timer = null;
        index = (index + 1) % count;
        onChange(index);
        queue();
      }, delay);
    };
    const select = (nextIndex) => {
      index = (nextIndex + count) % count;
      onChange(index);
      queue();
    };
    return { start: queue, stop, select, next: () => select(index + 1), prev: () => select(index - 1) };
  };

  const initProductGallery = (root) => {
    const track = root.querySelector('[data-gallery-track]');
    const slides = [...root.querySelectorAll('[data-gallery-slide]')];
    const dots = [...root.querySelectorAll('[data-gallery-dot]')];
    const previous = root.querySelector('[data-gallery-prev]');
    const next = root.querySelector('[data-gallery-next]');
    const reducedMotion = globalScope.matchMedia('(prefers-reduced-motion: reduce)');
    let pointerStart = null;
    const render = (index) => {
      track.style.transform = `translateX(${-100 * index}%)`;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('product-gallery__slide--active', slideIndex === index));
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('product-gallery__dot--active', dotIndex === index);
        dot.setAttribute('aria-selected', String(dotIndex === index));
      });
    };
    const slider = createProductGalleryState({ count: slides.length, onChange: render });
    const syncAutoplay = () => {
      if (shouldGalleryPause({ reducedMotion: reducedMotion.matches, documentHidden: document.hidden })) slider.stop();
      else slider.start();
    };
    previous.addEventListener('click', slider.prev);
    next.addEventListener('click', slider.next);
    dots.forEach((dot, index) => dot.addEventListener('click', () => slider.select(index)));
    root.addEventListener('pointerdown', (event) => { pointerStart = event.clientX; });
    root.addEventListener('pointerup', (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) < 45) return;
      distance < 0 ? slider.next() : slider.prev();
    });
    root.addEventListener('pointercancel', () => { pointerStart = null; });
    document.addEventListener('visibilitychange', syncAutoplay);
    reducedMotion.addEventListener('change', syncAutoplay);
    render(0);
    syncAutoplay();
    return slider;
  };

  globalScope.createProductGalleryState = createProductGalleryState;
  globalScope.shouldGalleryPause = shouldGalleryPause;
  if (typeof module !== 'undefined') module.exports = { createProductGalleryState, shouldGalleryPause };
  if (typeof document !== 'undefined') document.querySelectorAll('[data-product-gallery]').forEach(initProductGallery);
}(typeof window === 'undefined' ? globalThis : window));
