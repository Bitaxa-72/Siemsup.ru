(function exposeModalLock(globalScope) {
  const createModalLock = (scope, documentScope) => {
    let depth = 0;
    let bodyPadding = '';
    let bodyOverflow = '';
    let compensation = '';

    const lock = () => {
      depth += 1;
      if (depth > 1) return;
      const width = Math.max(0, scope.innerWidth - documentScope.documentElement.clientWidth);
      const currentPadding = parseFloat(scope.getComputedStyle(documentScope.body).paddingRight) || 0;
      bodyPadding = documentScope.body.style.paddingRight;
      bodyOverflow = documentScope.body.style.overflow;
      compensation = documentScope.documentElement.style.getPropertyValue('--scrollbar-compensation');
      documentScope.documentElement.style.setProperty('--scrollbar-compensation', `${width}px`);
      documentScope.body.style.paddingRight = `${currentPadding + width}px`;
      documentScope.body.style.overflow = 'hidden';
      documentScope.body.classList.add('has-modal-lock');
    };

    const unlock = () => {
      if (!depth) return;
      depth -= 1;
      if (depth) return;
      documentScope.body.style.paddingRight = bodyPadding;
      documentScope.body.style.overflow = bodyOverflow;
      if (compensation) documentScope.documentElement.style.setProperty('--scrollbar-compensation', compensation);
      else documentScope.documentElement.style.removeProperty('--scrollbar-compensation');
      documentScope.body.classList.remove('has-modal-lock');
    };

    return { lock, unlock, getDepth: () => depth };
  };

  globalScope.createModalLock = createModalLock;
  if (typeof module !== 'undefined') module.exports = { createModalLock };
  if (typeof document !== 'undefined') globalScope.SiemsupModalLock = createModalLock(globalScope, document);
}(typeof window === 'undefined' ? globalThis : window));
