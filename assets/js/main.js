const menuToggles = document.querySelectorAll('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const siteHeader = document.querySelector('.header');
const stickyHeader = document.querySelector('[data-sticky-header]');

const syncStickyHeader = () => {
  siteHeader.style.setProperty('--sticky-height', `${stickyHeader.offsetHeight}px`);
  siteHeader.classList.toggle('is-fixed', window.scrollY > 8);
};

window.addEventListener('scroll', syncStickyHeader, { passive: true });
window.addEventListener('resize', syncStickyHeader);
syncStickyHeader();

menuToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    menuToggles.forEach((button) => button.setAttribute('aria-expanded', String(isOpen)));
  });
});

const catalogToggle = document.querySelector('[data-catalog-toggle]');
const catalogMenu = document.querySelector('[data-catalog-menu]');
const closeCatalog = () => {
  catalogMenu.classList.remove('is-open');
  catalogToggle.setAttribute('aria-expanded', 'false');
};

catalogToggle.addEventListener('click', () => {
  const isOpen = catalogMenu.classList.toggle('is-open');
  catalogToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-catalog-toggle]') && !event.target.closest('[data-catalog-menu]')) closeCatalog();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCatalog();
});

const navigationGroups = document.querySelectorAll('.header__nav-item');

navigationGroups.forEach((group) => {
  group.addEventListener('toggle', () => {
    if (group.open) navigationGroups.forEach((item) => { if (item !== group) item.open = false; });
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.header__nav-item')) navigationGroups.forEach((group) => { group.open = false; });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') navigationGroups.forEach((group) => { group.open = false; });
});

const requestForm = document.querySelector('.request__form');

if (requestForm) requestForm.addEventListener('submit', (event) => event.preventDefault());

const heroSlider = document.querySelector('[data-hero-slider]');

if (heroSlider && typeof window.createHeroSliderState === 'function') {
  const heroSlides = [...heroSlider.querySelectorAll('[data-hero-slide]')];
  const heroTabs = [...heroSlider.querySelectorAll('[data-hero-tab]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const renderHeroSlide = (index) => {
    heroSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    heroTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  };

  const heroState = window.createHeroSliderState({ count: heroSlides.length, onChange: renderHeroSlide });
  const syncHeroPlayback = () => {
    const isPaused = window.shouldHeroPause({ reducedMotion: reducedMotion.matches, documentHidden: document.hidden });
    heroSlider.classList.toggle('is-paused', isPaused);
    if (isPaused) heroState.stop();
    else heroState.start();
  };
  const selectHeroSlide = (index) => {
    heroState.select(index);
    syncHeroPlayback();
  };

  heroTabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      selectHeroSlide(index);
      if (event.detail > 0) tab.blur();
    });
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % heroTabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + heroTabs.length) % heroTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = heroTabs.length - 1;
      else return;
      event.preventDefault();
      heroTabs[nextIndex].focus();
      selectHeroSlide(nextIndex);
    });
  });

  document.addEventListener('visibilitychange', syncHeroPlayback);
  reducedMotion.addEventListener('change', syncHeroPlayback);
  syncHeroPlayback();
}

const stockSliders = document.querySelectorAll('[data-stock-slider]');

if (stockSliders.length && typeof window.Swiper === 'function' && typeof window.createStockSlider === 'function') {
  stockSliders.forEach((slider) => window.createStockSlider(window.Swiper, slider));
}
