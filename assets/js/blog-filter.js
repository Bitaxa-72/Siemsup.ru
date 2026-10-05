(function initBlogFilters() {
  const form = document.querySelector('[data-blog-filters]');
  if (!form) return;

  const cards = [...document.querySelectorAll('[data-blog-card]')];
  const empty = document.querySelector('[data-blog-empty]');

  const filterCards = () => {
    const category = form.elements.category.value;
    const brand = form.elements.brand.value;
    let visibleCount = 0;

    [...form.elements].forEach((select) => {
      select.closest('label').querySelector('span').textContent = select.value ? select.selectedOptions[0].textContent : select.name === 'category' ? 'Категории' : 'Бренды';
    });

    cards.forEach((card) => {
      const visible = (!category || card.dataset.category === category) && (!brand || card.dataset.brand === brand);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    empty.hidden = visibleCount > 0;
  };

  form.addEventListener('change', filterCards);
}());
