const createCartInteraction = (globalScope, documentScope) => {
  const storageKey = 'siemsup-cart-count';
  const buttons = [...documentScope.querySelectorAll('.home-product__cart, [data-add-cart]')];
  const cart = documentScope.querySelector('.header__cart');
  const counter = documentScope.querySelector('[data-cart-count]');
  const timers = new WeakMap();
  const readCount = () => {
    try {
      const value = Number.parseInt(globalScope.localStorage.getItem(storageKey), 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
      return 0;
    }
  };
  const writeCount = (value) => {
    try {
      globalScope.localStorage.setItem(storageKey, String(value));
    } catch {}
  };
  const updateCounter = (value) => {
    if (!counter || !cart) return;
    counter.textContent = value > 99 ? '99+' : String(value);
    counter.hidden = value === 0;
    counter.style.display = value === 0 ? 'none' : 'grid';
    cart.setAttribute('aria-label', value ? `Корзина, товаров: ${value}` : 'Корзина');
  };
  const findImage = (button) => button.closest('.home-product, .product-card, .product-view')?.querySelector('.product-gallery__slide--active img, img');
  const animateToCart = (button) => {
    if (!cart || globalScope.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const image = findImage(button);
    if (!image) return;
    const start = image.getBoundingClientRect();
    const finish = cart.getBoundingClientRect();
    const flyer = image.cloneNode(true);
    flyer.className = 'cart-flyer';
    flyer.style.left = `${start.left}px`;
    flyer.style.top = `${start.top}px`;
    flyer.style.width = `${start.width}px`;
    flyer.style.height = `${start.height}px`;
    flyer.style.setProperty('--cart-flight-x', `${finish.left + finish.width / 2 - start.left - start.width / 2}px`);
    flyer.style.setProperty('--cart-flight-y', `${finish.top + finish.height / 2 - start.top - start.height / 2}px`);
    documentScope.body.append(flyer);
    globalScope.requestAnimationFrame(() => flyer.classList.add('cart-flyer--active'));
    globalScope.setTimeout(() => flyer.remove(), 720);
  };
  const pulseCart = () => {
    if (!cart) return;
    cart.classList.remove('header__cart--updated');
    void cart.offsetWidth;
    cart.classList.add('header__cart--updated');
    globalScope.setTimeout(() => cart.classList.remove('header__cart--updated'), 500);
  };
  const setButtonState = (button) => {
    button.textContent = 'Добавлено';
    button.setAttribute('aria-label', 'Товар добавлен в корзину');
    if (timers.has(button)) globalScope.clearTimeout(timers.get(button));
    timers.set(button, globalScope.setTimeout(() => {
      button.innerHTML = '<span aria-hidden="true">＋</span>Добавить в корзину';
      button.removeAttribute('aria-label');
      timers.delete(button);
    }, 900));
  };
  const add = (button) => {
    const count = readCount() + 1;
    writeCount(count);
    updateCounter(count);
    animateToCart(button);
    pulseCart();
    setButtonState(button);
  };
  buttons.forEach((button) => {
    button.innerHTML = '<span aria-hidden="true">＋</span>Добавить в корзину';
    button.setAttribute('data-add-cart', '');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      add(button);
    });
  });
  updateCounter(readCount());
  return { readCount, add, updateCounter };
};

if (typeof module !== 'undefined') module.exports = { createCartInteraction };
if (typeof document !== 'undefined') createCartInteraction(window, document);
