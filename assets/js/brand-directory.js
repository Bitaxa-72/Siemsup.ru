const normalizeBrandValue = (value = '') => String(value).trim().toLocaleLowerCase('ru-RU');

const filterBrands = (records, { letter = '', query = '' } = {}) => {
  const normalizedLetter = normalizeBrandValue(letter);
  const normalizedQuery = normalizeBrandValue(query);
  return records
    .filter(({ name }) => !normalizedLetter || normalizeBrandValue(name).startsWith(normalizedLetter))
    .filter(({ name, category = '' }) => !normalizedQuery || normalizeBrandValue(`${name} ${category}`).includes(normalizedQuery))
    .sort((left, right) => left.name.localeCompare(right.name, 'en'));
};

if (typeof module !== 'undefined') module.exports = { filterBrands };

if (typeof document !== 'undefined') {
  const directory = document.querySelector('[data-brand-directory]');
  if (directory) {
    const form = directory.querySelector('[data-brand-search]');
    const input = form.querySelector('input[type="search"]');
    const list = directory.querySelector('[data-brand-list]');
    const count = directory.querySelector('[data-brand-count]');
    const stateLabel = directory.querySelector('[data-brand-state]');
    const empty = directory.querySelector('[data-brand-empty]');
    const buttons = [...directory.querySelectorAll('[data-brand-letter]')];
    const params = new URLSearchParams(window.location.search);
    const state = { letter: params.get('letter') || '', query: params.get('brand') || '' };
    let records = [...list.querySelectorAll('[data-brand-card]')].map((card) => ({
      name: card.dataset.brandName,
      slug: card.dataset.brandSlug,
      category: card.dataset.brandCategory,
      popular: card.dataset.brandPopular === 'true',
    }));

    const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
    const brandCard = ({ name, slug, category, popular }) => `<a class="manufacturer-tile${popular ? ' manufacturer-tile--featured' : ''}" data-brand-card data-brand-name="${escapeHtml(name)}" data-brand-slug="${escapeHtml(slug)}" data-brand-category="${escapeHtml(category)}" data-brand-popular="${popular}" href="/manufacturers/siemens/?brand=${encodeURIComponent(slug)}"><small>${popular ? 'Популярный бренд' : 'Производитель'}</small><strong>${escapeHtml(name)}</strong><span>${escapeHtml(category)}</span><b>Открыть каталог →</b></a>`;
    const plural = (value) => value % 10 === 1 && value % 100 !== 11 ? 'производитель' : value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20) ? 'производителя' : 'производителей';
    const syncUrl = () => {
      const url = new URL(window.location.href);
      state.letter ? url.searchParams.set('letter', state.letter) : url.searchParams.delete('letter');
      state.query ? url.searchParams.set('brand', state.query) : url.searchParams.delete('brand');
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    };
    const render = () => {
      const filtered = filterBrands(records, state);
      list.innerHTML = filtered.map(brandCard).join('');
      count.textContent = `${filtered.length} ${plural(filtered.length)}`;
      stateLabel.textContent = state.letter ? `Буква ${state.letter}` : state.query ? `Поиск: ${state.query}` : 'Все бренды';
      empty.hidden = filtered.length > 0;
      buttons.forEach((button) => {
        const active = button.dataset.brandLetter === state.letter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      directory.classList.remove('is-loading');
      syncUrl();
    };

    input.value = state.query;
    buttons.forEach((button) => button.addEventListener('click', () => {
      state.letter = button.dataset.brandLetter;
      render();
    }));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.query = input.value.trim();
      render();
    });
    input.addEventListener('input', () => {
      state.query = input.value.trim();
      render();
    });

    directory.classList.add('is-loading');
    fetch(directory.dataset.brandSource, { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data) => {
        records = data;
        render();
      })
      .catch(() => {
        stateLabel.textContent = 'Показан резервный список';
        render();
      });
  }
}
