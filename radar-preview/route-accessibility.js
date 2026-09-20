(() => {
  const interactive = 'a,button,input,select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"]';

  function labelFor(el) {
    const heading = el.querySelector('h1,h2,h3,h4,strong');
    const text = (heading ? heading.textContent : el.textContent || '').replace(/\s+/g, ' ').trim();
    return text ? `Open ${text.slice(0, 160)}` : 'Open details';
  }

  function focusMainAfterRoute() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const main = document.getElementById('main');
        if (!main) return;
        main.focus({preventScroll: true});
        main.scrollIntoView({block: 'start'});
      });
    });
  }

  function syncCurrentNavigation(root = document) {
    const doc = root === document ? document : (root.ownerDocument || document);
    doc.querySelectorAll('.nav-item[aria-current="page"], #mobileNav [aria-current="page"]').forEach((el) => {
      el.removeAttribute('aria-current');
    });

    const activeDesktop = doc.querySelector('.nav-item.active[data-route]');
    if (activeDesktop) {
      activeDesktop.setAttribute('aria-current', 'page');
      const route = activeDesktop.getAttribute('data-route');
      doc.querySelectorAll('#mobileNav [data-route]').forEach((el) => {
        if (el.getAttribute('data-route') === route) el.setAttribute('aria-current', 'page');
      });
      return;
    }

    doc.querySelectorAll('.nav-item.active').forEach((el) => {
      el.setAttribute('aria-current', 'page');
    });
  }

  function harden(root = document) {
    root.querySelectorAll('[data-route]').forEach((el) => {
      if (el.matches(interactive) || el.querySelector(interactive) || el.hasAttribute('data-route-a11y')) return;
      el.setAttribute('data-route-a11y', 'true');
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', labelFor(el));
      el.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        el.click();
        focusMainAfterRoute();
      });
    });
    syncCurrentNavigation(root === document ? document : (root.ownerDocument || document));
  }

  harden();
  new MutationObserver((mutations) => {
    let navigationMayHaveChanged = false;
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && (mutation.target.classList?.contains('nav-item') || mutation.target.closest?.('#mobileNav'))) {
        navigationMayHaveChanged = true;
      }
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('[data-route]')) harden(node.parentElement || document);
        else if (node.querySelector('[data-route]')) harden(node);
        if (node.matches('.nav-item, #mobileNav, #mobileNav *') || node.querySelector('.nav-item, #mobileNav [data-route]')) navigationMayHaveChanged = true;
      }
    }
    if (navigationMayHaveChanged) syncCurrentNavigation();
  }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
})();
