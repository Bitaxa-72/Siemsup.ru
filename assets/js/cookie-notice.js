(function exposeCookieNotice(globalScope) {
  const initCookieNotice = (scope, documentScope, storage) => {
    const key = 'siemsup-cookie-consent';
    const version = 'COOKIE-2026-10-04';
    const lifetime = 365 * 24 * 60 * 60 * 1000;
    let saved = null;
    try { saved = JSON.parse(storage.getItem(key)); } catch {}
    if (saved?.version === version && Number(saved.expires) > Date.now()) return null;

    const notice = documentScope.createElement('section');
    notice.className = 'cookie-notice';
    notice.setAttribute('aria-label', 'Уведомление о cookie');
    notice.innerHTML = `<div><strong>Технические данные браузера</strong><p>Сайт сохраняет необходимые записи для корзины и интерфейса, включая незавершённое оформление заказа. Аналитические и рекламные cookie не используются. Подробнее — в <a href="/cookie/">политике cookie</a>.</p></div><div class="cookie-notice__actions"><button type="button" data-cookie-essential>Понятно</button></div>`;
    documentScope.body.append(notice);
    scope.requestAnimationFrame(() => notice.classList.add('is-visible'));

    const save = () => {
      try { storage.setItem(key, JSON.stringify({ choice: 'essential', version, expires: Date.now() + lifetime })); } catch {}
      notice.classList.remove('is-visible');
      notice.addEventListener('transitionend', () => notice.remove(), { once: true });
    };
    notice.querySelector('[data-cookie-essential]').addEventListener('click', save);
    return notice;
  };

  globalScope.initCookieNotice = initCookieNotice;
  if (typeof module !== 'undefined') module.exports = { initCookieNotice };
  if (typeof document !== 'undefined') initCookieNotice(globalScope, document, globalScope.localStorage);
}(typeof window === 'undefined' ? globalThis : window));
