(function initCheckout(globalScope) {
  const form = document.querySelector('[data-checkout-form]');
  if (!form) return;

  const draftKey = 'siemsup-checkout-draft';
  const draftVersion = 1;
  const draftLifetime = 30 * 24 * 60 * 60 * 1000;
  const personalFieldNames = ['name', 'phone', 'email', 'city', 'postal-code', 'street', 'house', 'apartment'];
  const savedFieldNames = ['name', 'phone', 'email', 'company', 'inn', 'kpp', 'legal-address', 'city', 'postal-code', 'street', 'house', 'apartment'];
  const legal = document.querySelector('[data-checkout-legal]');
  const legalInputs = [...document.querySelectorAll('[data-checkout-legal-input]')];
  const typeButtons = [...document.querySelectorAll('[data-checkout-type]')];
  const requiredControls = [...form.querySelectorAll('[required]')];
  const savedFields = savedFieldNames.map((name) => form.elements.namedItem(name)).filter(Boolean);
  let draftTimer;

  form.noValidate = true;

  const markRequiredLabels = () => {
    form.querySelectorAll('.checkout-field').forEach((field) => {
      const control = field.querySelector('[required]');
      const caption = field.querySelector('span');
      if (!control || !caption || caption.querySelector('.checkout-field__required')) return;
      caption.textContent = caption.textContent.replace(/\s*\*\s*$/, '');
      const marker = document.createElement('b');
      marker.className = 'checkout-field__required';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = '*';
      caption.append(' ', marker);
    });
  };

  const getErrorMessage = (control) => {
    if (control.validity.valueMissing) {
      return control.type === 'checkbox' ? 'Подтвердите это условие' : 'Заполните это поле';
    }
    if (control.validity.typeMismatch && control.type === 'email') return 'Введите корректный адрес электронной почты';
    return 'Проверьте правильность заполнения';
  };

  const getErrorHost = (control) => {
    if (control.name === 'captcha') return control.closest('.checkout-captcha');
    if (control.name === 'agreement') return control.closest('.checkout-agreement');
    return control.closest('.checkout-field');
  };

  const clearError = (control) => {
    const host = getErrorHost(control);
    if (!host) return;
    control.classList.remove('checkout-control--error');
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    host.classList.remove('checkout-captcha--error', 'checkout-agreement--error');
    const error = host.querySelector(`[data-checkout-error-for="${control.name}"]`);
    if (error) error.remove();
  };

  const showError = (control) => {
    const host = getErrorHost(control);
    if (!host) return false;
    clearError(control);
    const error = document.createElement('small');
    const errorId = `checkout-error-${control.name}`;
    error.id = errorId;
    error.className = control.type === 'checkbox' ? 'checkout-option__error' : 'checkout-field__error';
    error.dataset.checkoutErrorFor = control.name;
    error.setAttribute('aria-live', 'polite');
    error.textContent = getErrorMessage(control);
    control.classList.add('checkout-control--error');
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', errorId);
    if (control.name === 'captcha') host.classList.add('checkout-captcha--error');
    if (control.name === 'agreement') host.classList.add('checkout-agreement--error');
    host.append(error);
    return false;
  };

  const validateControl = (control) => {
    if (control.disabled || control.checkValidity()) {
      clearError(control);
      return true;
    }
    return showError(control);
  };

  const selectType = (type) => {
    const isCompany = type === 'company';
    legal.hidden = !isCompany;
    legalInputs.forEach((input) => {
      input.disabled = !isCompany;
      if (!isCompany) clearError(input);
    });
    typeButtons.forEach((button) => {
      const isActive = button.dataset.checkoutType === type;
      button.classList.toggle('checkout-type__button--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const removeDraft = () => {
    try { globalScope.localStorage.removeItem(draftKey); } catch {}
  };

  const readDraft = () => {
    try {
      const draft = JSON.parse(globalScope.localStorage.getItem(draftKey));
      if (draft?.version !== draftVersion || Number(draft.expires) <= Date.now() || typeof draft.fields !== 'object') {
        removeDraft();
        return null;
      }
      return draft;
    } catch {
      removeDraft();
      return null;
    }
  };

  const getSelectedType = () => typeButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.checkoutType || 'person';

  const writeDraft = () => {
    const relevantFieldNames = getSelectedType() === 'company' ? savedFieldNames : personalFieldNames;
    const fields = Object.fromEntries(relevantFieldNames.map((name) => [name, form.elements.namedItem(name).value]));
    try {
      globalScope.localStorage.setItem(draftKey, JSON.stringify({ version: draftVersion, expires: Date.now() + draftLifetime, type: getSelectedType(), fields }));
    } catch {}
  };

  const scheduleDraft = () => {
    globalScope.clearTimeout(draftTimer);
    draftTimer = globalScope.setTimeout(writeDraft, 250);
  };

  const clearDraft = () => {
    globalScope.clearTimeout(draftTimer);
    removeDraft();
  };

  const restoreDraft = () => {
    const draft = readDraft();
    if (!draft) return;
    selectType(draft.type === 'company' ? 'company' : 'person');
    savedFields.forEach((field) => {
      if (typeof draft.fields[field.name] === 'string') field.value = draft.fields[field.name];
    });
  };

  requiredControls.forEach((control) => {
    control.addEventListener('blur', () => validateControl(control));
    control.addEventListener(control.type === 'checkbox' ? 'change' : 'input', () => {
      if (control.getAttribute('aria-invalid') === 'true') validateControl(control);
    });
  });

  savedFields.forEach((field) => field.addEventListener('input', scheduleDraft));
  typeButtons.forEach((button) => button.addEventListener('click', () => {
    selectType(button.dataset.checkoutType);
    scheduleDraft();
  }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const activeRequiredControls = requiredControls.filter((control) => !control.disabled);
    const isValid = activeRequiredControls.map(validateControl).every(Boolean);
    if (!isValid) {
      const firstInvalid = activeRequiredControls.find((control) => !control.checkValidity());
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid?.focus({ preventScroll: true });
      return;
    }
    clearDraft();
    globalScope.localStorage.setItem('siemsup-cart-count', '0');
    const counter = document.querySelector('[data-cart-count]');
    if (counter) {
      counter.textContent = '0';
      counter.hidden = true;
      counter.style.display = 'none';
    }
    globalScope.location.assign(form.action);
  });

  markRequiredLabels();
  selectType('person');
  restoreDraft();
}(window));
