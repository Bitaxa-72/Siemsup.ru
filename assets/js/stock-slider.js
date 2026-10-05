(function exposeStockSlider(globalScope) {
  const createStockSlider = (SwiperClass, element) => {
    const section = element.closest('[data-stock-section]');
    return new SwiperClass(element, {
      slidesPerView: 1.08,
      spaceBetween: 12,
      grabCursor: true,
      watchOverflow: true,
      navigation: {
        prevEl: section.querySelector('[data-stock-prev]'),
        nextEl: section.querySelector('[data-stock-next]'),
      },
      breakpoints: {
        520: { slidesPerView: 2, spaceBetween: 14 },
        820: { slidesPerView: 3, spaceBetween: 16 },
        1120: { slidesPerView: 4, spaceBetween: 18 },
      },
    });
  };

  globalScope.createStockSlider = createStockSlider;
  if (typeof module !== 'undefined') module.exports = { createStockSlider };
}(typeof window === 'undefined' ? globalThis : window));
