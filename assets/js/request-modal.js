(function exposeRequestModal(globalScope) {
  const isRequestPath = (href) => {
    try {
      return new URL(href, 'http://localhost').pathname.replace(/\/+$/, '') === '/send';
    } catch {
      return false;
    }
  };

  globalScope.isRequestPath = isRequestPath;
  if (typeof module !== 'undefined') module.exports = { isRequestPath };
  if (typeof document === 'undefined') return;

  const modal = document.createElement('dialog');
  modal.className = 'request-modal';
  modal.setAttribute('aria-labelledby', 'request-modal-title');
  modal.innerHTML = `
    <div class="request-modal__panel">
      <button class="request-modal__close" type="button" data-request-close aria-label="Закрыть"></button>
      <div class="request-modal__intro">
        <p class="eyebrow">Быстрый запрос</p>
        <h2 id="request-modal-title">Оставить заявку</h2>
        <p>Оставьте контакты и укажите артикул или задачу. Менеджер свяжется с вами для уточнения деталей.</p>
      </div>
      <form class="request-modal__form" novalidate>
        <label class="request-modal__field"><span>Ваше имя <b>*</b></span><input type="text" name="name" autocomplete="name" placeholder="Как к вам обращаться" required></label>
        <label class="request-modal__field"><span>Телефон или email <b>*</b></span><input type="text" name="contact" autocomplete="tel" placeholder="Контакт для ответа" required></label>
        <label class="request-modal__field"><span>Оборудование или задача <b>*</b></span><textarea name="message" placeholder="Артикул, производитель или описание задачи" required></textarea></label>
        <input type="hidden" name="consent_version" value="PD-CONSENT-2026-10-04">
        <label class="request-modal__consent"><input type="checkbox" name="personal_data_consent" required><span>Даю <a href="/soglashenie/" target="_blank" rel="noopener">согласие на обработку персональных данных</a>.</span></label>
        <button class="button button--primary" type="submit">Отправить запрос <span>→</span></button>
        <p class="request-modal__notice">Порядок обработки и защиты данных указан в <a href="/policy/" target="_blank" rel="noopener">политике конфиденциальности</a>.</p>
      </form>
      <div class="request-modal__success" hidden><span>✓</span><h2>Запрос принят</h2><p>Свяжемся с вами после уточнения информации.</p><button class="button button--primary" type="button" data-request-close>Закрыть</button></div>
    </div>`;
  document.body.append(modal);

  const form = modal.querySelector('form');
  const success = modal.querySelector('.request-modal__success');
  const requiredControls = [...form.querySelectorAll('[required]')];
  const eyebrow = modal.querySelector('.request-modal__intro .eyebrow');
  const title = modal.querySelector('.request-modal__intro h2');
  const description = modal.querySelector('.request-modal__intro > p:last-child');
  const nameInput = form.elements.name;
  const contactInput = form.elements.contact;
  const messageInput = form.elements.message;
  const contactLabel = contactInput.closest('label').querySelector('span');
  const messageLabel = messageInput.closest('label').querySelector('span');
  const submitButton = form.querySelector('[type="submit"]');
  const successTitle = success.querySelector('h2');
  const successText = success.querySelector('p');
  let trigger = null;
  let isCareerMode = false;

  const getErrorMessage = (control) => {
    if (control.type === 'checkbox') return 'Необходимо дать согласие';
    if (control.name === 'contact' && control.value.trim()) {
      const digits = control.value.replace(/\D/g, '');
      if (isCareerMode && digits.length < 10) return 'Введите номер телефона';
      if (!control.value.includes('@') && digits.length < 10) return 'Введите телефон или email';
    }
    return 'Заполните это поле';
  };

  const isControlValid = (control) => {
    if (!control.checkValidity()) return false;
    if (control.name !== 'contact') return true;
    const digits = control.value.replace(/\D/g, '');
    if (isCareerMode) return digits.length >= 10;
    return control.value.includes('@') || digits.length >= 10;
  };

  const clearError = (control) => {
    const host = control.closest('.request-modal__field, .request-modal__consent');
    if (!host) return;
    control.classList.remove('request-modal__control--error');
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    host.classList.remove('request-modal__consent--error');
    host.querySelector('.request-modal__error')?.remove();
  };

  const validateControl = (control) => {
    clearError(control);
    if (isControlValid(control)) return true;
    const host = control.closest('.request-modal__field, .request-modal__consent');
    const error = document.createElement('small');
    const errorId = `request-error-${control.name}`;
    error.id = errorId;
    error.className = 'request-modal__error';
    error.setAttribute('aria-live', 'polite');
    error.textContent = getErrorMessage(control);
    host.append(error);
    control.classList.add('request-modal__control--error');
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', errorId);
    if (control.type === 'checkbox') host.classList.add('request-modal__consent--error');
    return false;
  };

  const closeModal = () => modal.close();
  const configureModal = (source) => {
    const role = source?.dataset.requestRole || '';
    isCareerMode = Boolean(role);
    eyebrow.textContent = isCareerMode ? 'Отклик на должность' : 'Быстрый запрос';
    title.textContent = isCareerMode ? 'Хочу у вас работать' : 'Оставить заявку';
    description.textContent = isCareerMode ? 'Оставьте имя и номер телефона. Мы свяжемся с вами и уточним детали.' : 'Оставьте контакты и укажите артикул или задачу. Менеджер свяжется с вами для уточнения деталей.';
    contactLabel.innerHTML = isCareerMode ? 'Номер телефона <b>*</b>' : 'Телефон или email <b>*</b>';
    contactInput.type = isCareerMode ? 'tel' : 'text';
    contactInput.autocomplete = isCareerMode ? 'tel' : 'tel';
    contactInput.placeholder = isCareerMode ? '+7 900 000-00-00' : 'Контакт для ответа';
    messageLabel.innerHTML = isCareerMode ? 'Комментарий <b>*</b>' : 'Оборудование или задача <b>*</b>';
    messageInput.placeholder = isCareerMode ? 'Дополнительная информация' : 'Артикул, производитель или описание задачи';
    messageInput.value = isCareerMode ? `Должность: ${role}` : '';
    submitButton.innerHTML = isCareerMode ? 'Отправить отклик <span>→</span>' : 'Отправить запрос <span>→</span>';
    successTitle.textContent = isCareerMode ? 'Отклик отправлен' : 'Запрос принят';
    successText.textContent = isCareerMode ? 'Свяжемся с вами после рассмотрения отклика.' : 'Свяжемся с вами после уточнения информации.';
    nameInput.value = '';
    contactInput.value = '';
  };
  const openModal = (source) => {
    trigger = source || document.activeElement;
    configureModal(source);
    if (!modal.open) {
      if (globalScope.SiemsupModalLock) globalScope.SiemsupModalLock.lock();
      modal.showModal();
    }
    document.body.classList.add('has-request-modal');
    nameInput.focus();
  };

  modal.querySelectorAll('[data-request-close]').forEach((button) => button.addEventListener('click', closeModal));
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  modal.addEventListener('close', () => {
    document.body.classList.remove('has-request-modal');
    if (globalScope.SiemsupModalLock) globalScope.SiemsupModalLock.unlock();
    form.hidden = false;
    success.hidden = true;
    form.reset();
    requiredControls.forEach(clearError);
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
  });
  requiredControls.forEach((control) => {
    control.addEventListener('blur', () => validateControl(control));
    control.addEventListener(control.type === 'checkbox' ? 'change' : 'input', () => {
      if (control.getAttribute('aria-invalid') === 'true') validateControl(control);
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = requiredControls.map(validateControl).every(Boolean);
    if (!isValid) {
      const firstInvalid = requiredControls.find((control) => !isControlValid(control));
      firstInvalid?.focus();
      return;
    }
    form.hidden = true;
    success.hidden = false;
    success.querySelector('button').focus();
  });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !isRequestPath(link.href)) return;
    event.preventDefault();
    openModal(link);
  });

  if (isRequestPath(window.location.href)) setTimeout(() => openModal());
}(typeof window === 'undefined' ? globalThis : window));
