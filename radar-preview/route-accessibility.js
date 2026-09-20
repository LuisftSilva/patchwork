(() => {
  const interactive = 'a,button,input,select,textarea,summary,[contenteditable="true"]';

  function labelFor(el) {
    const heading = el.querySelector('h1,h2,h3,h4,strong');
    const text = (heading ? heading.textContent : el.textContent || '').replace(/\s+/g, ' ').trim();
    return text ? `Open ${text.slice(0, 160)}` : 'Open details';
  }

  function syncCurrentNavigation(root = document) {
    root.querySelectorAll('.nav-item[aria-current="page"]').forEach((el) => {
      if (!el.classList.contains('active')) el.removeAttribute('aria-current');
    });
    root.querySelectorAll('.nav-item.active').forEach((el) => {
      el.setAttribute('aria-current', 'page');
    });
  }

  function harden(root = document) {
    root.querySelectorAll('[data-route]').forEach((el) => {
      if (el.matches(interactive) || el.hasAttribute('data-route-a11y')) return;
      el.setAttribute('data-route-a11y', 'true');
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', labelFor(el));
      el.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        el.click();
      });
    });
    syncCurrentNavigation(root === document ? document : (root.ownerDocument || document));
  }

  harden();
  new MutationObserver((mutations) => {
    let navigationMayHaveChanged = false;
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.target.classList?.contains('nav-item')) {
        navigationMayHaveChanged = true;
      }
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('[data-route]')) harden(node.parentElement || document);
        else if (node.querySelector('[data-route]')) harden(node);
        if (node.matches('.nav-item') || node.querySelector('.nav-item')) navigationMayHaveChanged = true;
      }
    }
    if (navigationMayHaveChanged) syncCurrentNavigation();
  }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
})();
