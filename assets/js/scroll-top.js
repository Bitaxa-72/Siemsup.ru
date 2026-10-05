(function exposeScrollTop(globalScope) {
  const initScrollTop = (scope, documentScope) => {
    const buttons = documentScope.querySelectorAll('[data-scroll-top]');
    const widget = documentScope.querySelector('[data-scroll-widget]');
    const syncWidget = () => {
      if (widget) widget.classList.toggle('is-visible', scope.scrollY > 600);
    };

    buttons.forEach((button) => button.addEventListener('click', () => {
      scope.scrollTo({ top: 0, behavior: 'smooth' });
    }));
    scope.addEventListener('scroll', syncWidget, { passive: true });
    syncWidget();
    return { buttons, widget, syncWidget };
  };

  globalScope.initScrollTop = initScrollTop;
  if (typeof module !== 'undefined') module.exports = { initScrollTop };
  if (typeof document !== 'undefined') initScrollTop(globalScope, document);
}(typeof window === 'undefined' ? globalThis : window));
