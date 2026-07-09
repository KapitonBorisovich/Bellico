/* ============================================================
   BELLICO — Shared UI chrome
   Header, footer, cart drawer, modal shell, toasts, mobile menu,
   search overlay, sticky behaviour, scroll-reveal.
   ============================================================ */
window.Bellico = window.Bellico || {};

(function (B) {
  'use strict';
  var store = B.store;

  /* ---------------- Icon set ---------------- */
  var ICONS = {
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 8-9 16-9 0 8-3 16-9 16Z"/><path d="M4 20c4-5 8-7 12-8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.8 8.6c-.3.7 0 1.6.9 2.7.9 1.1 1.9 1.9 3 2.2.6.2 1.1 0 1.3-.5l.2-.5c.1-.3 0-.6-.3-.8l-1.1-.7c-.2-.2-.5-.1-.7.1l-.3.4c-.6-.3-1.1-.7-1.5-1.2-.4-.5-.7-1-.8-1.6l.4-.3c.2-.2.3-.4.2-.7l-.5-1.1c-.1-.3-.5-.5-.8-.3l-.5.3Z"/>',
    telegram: '<path d="m22 3-20 8 6 2 2 6 3-4 5 4 4-16Z"/>',
    star: '<path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1Z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v7h-7"/>',
    wallet: '<path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 7V5a2 2 0 0 1 2-2h11v4"/><path d="M16 13h.01"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    box: '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.5A1.6 1.6 0 0 0 11 3.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9.5a1.6 1.6 0 0 0 1.4 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
    pkg: '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>'
  };
  function svg(name, size) {
    size = size || 24;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  B.icon = svg;

  /* ---------------- Header ---------------- */
  function headerHTML() {
    return '' +
    '<div class="header__inner container">' +
      '<button class="icon-btn burger" aria-label="Открыть меню" data-action="open-menu">' + svg('menu') + '</button>' +
      '<a href="index.html" class="logo" aria-label="Bellico — на главную">Belli<span>c</span>o</a>' +
      '<nav class="nav" aria-label="Основная навигация">' +
        '<a class="nav__link" href="catalog.html" data-nav="catalog">Каталог</a>' +
        '<a class="nav__link" href="info.html" data-nav="info">Info</a>' +
        '<a class="nav__link" href="contacts.html" data-nav="contacts">Контакты</a>' +
      '</nav>' +
      '<div class="header__actions">' +
        '<button class="icon-btn" aria-label="Поиск" data-action="open-search">' + svg('search') + '</button>' +
        '<a class="icon-btn desktop-only" href="account.html#favorites" aria-label="Избранное">' + svg('heart') +
          '<span class="badge" data-badge="fav"></span></a>' +
        '<a class="icon-btn" href="account.html" aria-label="Личный кабинет">' + svg('user') + '</a>' +
        '<button class="icon-btn" aria-label="Корзина" data-action="open-cart">' + svg('bag') +
          '<span class="badge" data-badge="cart"></span></button>' +
      '</div>' +
    '</div>';
  }

  /* ---------------- Footer ---------------- */
  function footerHTML() {
    var year = new Date().getFullYear();
    return '' +
    '<div class="container">' +
      '<div class="footer__grid">' +
        '<div>' +
          '<div class="footer__logo">Belli<span>c</span>o</div>' +
          '<p class="footer__about">' + esc(B.config.footerAbout) + '</p>' +
          '<div class="footer__social">' +
            '<a href="' + esc(B.config.social.instagram) + '" aria-label="Instagram">' + svg('instagram', 18) + '</a>' +
            '<a href="' + esc(B.config.social.whatsapp) + '" aria-label="WhatsApp">' + svg('whatsapp', 18) + '</a>' +
            '<a href="' + esc(B.config.social.telegram) + '" aria-label="Telegram">' + svg('telegram', 18) + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Магазин</h4>' +
          '<a href="catalog.html">Каталог</a>' +
          '<a href="account.html#favorites">Избранное</a>' +
          '<a href="account.html">Личный кабинет</a>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Компания</h4>' +
          '<a href="info.html">Info</a>' +
          '<a href="contacts.html">Контакты</a>' +
          '<a href="privacy.html">Политика конфиденциальности</a>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Контакты</h4>' +
          '<button type="button" data-action="open-request">Оставить заявку</button>' +
          '<a href="' + esc(B.config.emailHref) + '">' + esc(B.config.email) + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer__bottom">' +
        '<span>© ' + year + ' Bellico. Все права защищены.</span>' +
        '<span><a href="privacy.html">Политика конфиденциальности</a> · <a href="info.html">Info</a> · <a href="contacts.html">Контакты</a></span>' +
      '</div>' +
    '</div>';
  }

  /* ---------------- Overlays (drawer / modal / menu / search / toast) ---------------- */
  function overlaysHTML() {
    return '' +
    /* Cart drawer */
    '<aside class="drawer" id="cart-drawer" aria-hidden="true" role="dialog" aria-label="Корзина">' +
      '<div class="drawer__overlay" data-action="close-cart"></div>' +
      '<div class="drawer__panel">' +
        '<div class="drawer__head">' +
          '<h3>Корзина <span data-cart-count></span></h3>' +
          '<button class="icon-btn" aria-label="Закрыть корзину" data-action="close-cart">' + svg('close') + '</button>' +
        '</div>' +
        '<div class="drawer__body" id="cart-body"></div>' +
        '<div class="drawer__foot" id="cart-foot" hidden>' +
          '<div class="drawer__total"><span>Итого</span><b data-cart-total></b></div>' +
          '<p class="drawer__sub">Доставка рассчитывается при оформлении заказа</p>' +
          '<a class="btn btn--block" href="checkout.html">Оформить заказ</a>' +
          '<button class="btn btn--ghost btn--block" data-action="close-cart">Продолжить покупки</button>' +
        '</div>' +
      '</div>' +
    '</aside>' +
    /* Product modal */
    '<div class="modal" id="modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Товар">' +
      '<div class="modal__overlay" data-action="close-modal"></div>' +
      '<div class="modal__dialog">' +
        '<button class="modal__close" aria-label="Закрыть" data-action="close-modal">' + svg('close') + '</button>' +
        '<div id="modal-content"></div>' +
      '</div>' +
    '</div>' +
    /* Mobile menu */
    '<div class="mobile-menu" id="mobile-menu" aria-hidden="true">' +
      '<div class="mobile-menu__overlay" data-action="close-menu"></div>' +
      '<div class="mobile-menu__panel">' +
        '<div class="mobile-menu__head">' +
          '<span class="logo">Belli<span>c</span>o</span>' +
          '<button class="icon-btn" aria-label="Закрыть меню" data-action="close-menu">' + svg('close') + '</button>' +
        '</div>' +
        '<nav class="mobile-menu__nav">' +
          '<a href="catalog.html">Каталог</a>' +
          '<a href="info.html">Info</a>' +
          '<a href="contacts.html">Контакты</a>' +
          '<a href="privacy.html">Политика конфиденциальности</a>' +
        '</nav>' +
        '<div class="mobile-menu__foot">' +
          '<a class="btn btn--ghost btn--block" href="account.html#favorites">Избранное</a>' +
          '<a class="btn btn--block" href="account.html">Личный кабинет</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    /* Search overlay */
    '<div class="modal" id="search-modal" aria-hidden="true" role="dialog" aria-label="Поиск">' +
      '<div class="modal__overlay" data-action="close-search"></div>' +
      '<div class="modal__dialog" style="max-width:640px;padding:40px;">' +
        '<button class="modal__close" aria-label="Закрыть" data-action="close-search">' + svg('close') + '</button>' +
        '<h3 style="font-size:1.8rem;margin-bottom:20px;">Поиск по каталогу</h3>' +
        '<form id="search-form" class="toolbar__search" style="max-width:none;">' +
          svg('search') +
          '<input type="search" name="q" placeholder="Например: диван, дуб, кресло…" aria-label="Поисковый запрос" autocomplete="off">' +
        '</form>' +
        '<p class="muted" style="margin-top:14px;font-size:.85rem;">Нажмите Enter, чтобы найти товары</p>' +
      '</div>' +
    '</div>' +
    /* Request modal (leave an inquiry) */
    '<div class="modal" id="request-modal" aria-hidden="true" role="dialog" aria-label="Оставить заявку">' +
      '<div class="modal__overlay" data-action="close-request"></div>' +
      '<div class="modal__dialog" style="max-width:480px;padding:44px;">' +
        '<button class="modal__close" aria-label="Закрыть" data-action="close-request">' + svg('close') + '</button>' +
        '<h3 style="font-size:1.8rem;margin-bottom:8px;">Оставить заявку</h3>' +
        '<p class="muted" style="margin-bottom:24px;font-size:.92rem;">Оставьте контакты — мы свяжемся с вами в ближайшее время.</p>' +
        '<form id="request-form" novalidate>' +
          '<div class="field">' +
            '<label for="rq-name">Имя <span class="req">*</span></label>' +
            '<input class="input" id="rq-name" name="rq-name" type="text" placeholder="Ваше имя" autocomplete="name">' +
            '<div class="field__error"></div>' +
          '</div>' +
          '<div class="field">' +
            '<label for="rq-phone">Телефон <span class="req">*</span></label>' +
            '<input class="input" id="rq-phone" name="rq-phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel">' +
            '<div class="field__error"></div>' +
          '</div>' +
          '<div class="field">' +
            '<label for="rq-message">Сообщение</label>' +
            '<textarea class="textarea" id="rq-message" name="rq-message" placeholder="Расскажите, что вас интересует (необязательно)"></textarea>' +
            '<div class="field__error"></div>' +
          '</div>' +
          '<button class="btn btn--block btn--lg" type="submit">Отправить заявку</button>' +
        '</form>' +
      '</div>' +
    '</div>' +
    /* Toasts */
    '<div class="toast-wrap" id="toast-wrap" aria-live="polite"></div>';
  }

  /* ---------------- Mount ---------------- */
  function mount() {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) { h.className = 'header'; h.innerHTML = headerHTML(); }
    if (f) { f.className = 'footer'; f.innerHTML = footerHTML(); }

    var wrap = document.createElement('div');
    wrap.innerHTML = overlaysHTML();
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    markActiveNav();
    wireActions();
    initSticky();
    initSearch();
    initRequestForm();
    refreshBadges();
    renderCart();
    initReveal();

    store.on('cart', function () { refreshBadges(); renderCart(); });
    store.on('favorites', refreshBadges);
  }

  function markActiveNav() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (a) { a.setAttribute('aria-current', 'page'); });
  }

  /* ---------------- Sticky header shadow ---------------- */
  function initSticky() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('header--scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Badges ---------------- */
  function refreshBadges() {
    setBadge('cart', store.cart.count());
    setBadge('fav', store.favorites.count());
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      var c = store.cart.count(); el.textContent = c ? '(' + c + ')' : '';
    });
  }
  function setBadge(name, n) {
    document.querySelectorAll('[data-badge="' + name + '"]').forEach(function (b) {
      b.textContent = n; b.classList.toggle('is-visible', n > 0);
    });
  }

  /* ---------------- Global action delegation ---------------- */
  function wireActions() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-action]');
      if (!t) return;
      var a = t.getAttribute('data-action');
      var map = {
        'open-cart': openCart, 'close-cart': closeCart,
        'close-modal': closeModal,
        'open-menu': openMenu, 'close-menu': closeMenu,
        'open-search': openSearch, 'close-search': closeSearch,
        'open-request': openRequest, 'close-request': closeRequest
      };
      if (map[a]) { e.preventDefault(); map[a](); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeCart(); closeModal(); closeMenu(); closeSearch(); closeRequest(); }
    });
  }

  function lockScroll(on) { document.body.classList.toggle('no-scroll', on); }

  /* ---- Drawer ---- */
  function openCart() { var d = document.getElementById('cart-drawer'); d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); lockScroll(true); }
  function closeCart() { var d = document.getElementById('cart-drawer'); if (!d) return; d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); maybeUnlock(); }

  function renderCart() {
    var body = document.getElementById('cart-body');
    var foot = document.getElementById('cart-foot');
    if (!body) return;
    var rows = store.cart.detailed();
    if (!rows.length) {
      body.innerHTML = '<div class="drawer__empty">' + svg('bag', 48) +
        '<h4>Корзина пуста</h4><p>Добавьте понравившиеся товары из каталога.</p>' +
        '<a class="btn btn--ghost" href="catalog.html" style="margin-top:18px;">Перейти в каталог</a></div>';
      if (foot) foot.hidden = true;
      return;
    }
    body.innerHTML = rows.map(function (r) {
      return '<div class="cart-item">' +
        '<img class="cart-item__img" src="' + r.variant.gallery[0] + '" alt="' + esc(r.product.name) + '">' +
        '<div class="cart-item__main">' +
          '<div class="cart-item__name">' + esc(r.product.name) + '</div>' +
          '<div class="cart-item__variant">' + esc(r.variant.label) + '</div>' +
          '<div class="cart-item__row">' +
            '<div class="qty qty--sm">' +
              '<button data-cart-dec="' + r.key + '" aria-label="Уменьшить">−</button>' +
              '<input type="text" value="' + r.qty + '" readonly aria-label="Количество">' +
              '<button data-cart-inc="' + r.key + '" aria-label="Увеличить">+</button>' +
            '</div>' +
            '<span class="cart-item__price">' + B.formatPrice(r.lineTotal) + '</span>' +
          '</div>' +
          '<button class="cart-item__remove" data-cart-remove="' + r.key + '">Удалить</button>' +
        '</div>' +
      '</div>';
    }).join('');
    if (foot) {
      foot.hidden = false;
      foot.querySelector('[data-cart-total]').textContent = B.formatPrice(store.cart.total());
    }
  }

  /* cart item controls (delegated, attached once) */
  document.addEventListener('click', function (e) {
    var inc = e.target.closest('[data-cart-inc]');
    var dec = e.target.closest('[data-cart-dec]');
    var rem = e.target.closest('[data-cart-remove]');
    if (inc) { var k = inc.getAttribute('data-cart-inc'); store.cart.setQty(k, getQty(k) + 1); }
    if (dec) { var k2 = dec.getAttribute('data-cart-dec'); store.cart.setQty(k2, Math.max(1, getQty(k2) - 1)); }
    if (rem) { store.cart.remove(rem.getAttribute('data-cart-remove')); toast('Товар удалён из корзины'); }
  });
  function getQty(key) { var it = store.cart.items().find(function (i) { return i.key === key; }); return it ? it.qty : 1; }

  /* ---- Modal ---- */
  function openModal(node) {
    var m = document.getElementById('modal');
    var c = document.getElementById('modal-content');
    c.innerHTML = ''; c.appendChild(node);
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true);
    m.querySelector('.modal__dialog').scrollTop = 0;
  }
  function closeModal() { var m = document.getElementById('modal'); if (!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); maybeUnlock(); }

  /* ---- Mobile menu ---- */
  function openMenu() { var m = document.getElementById('mobile-menu'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true); }
  function closeMenu() { var m = document.getElementById('mobile-menu'); if (!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); maybeUnlock(); }

  /* ---- Search ---- */
  function openSearch() {
    var m = document.getElementById('search-modal'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true);
    setTimeout(function () { var i = m.querySelector('input'); if (i) i.focus(); }, 120);
  }
  function closeSearch() { var m = document.getElementById('search-modal'); if (!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); maybeUnlock(); }
  function initSearch() {
    var form = document.getElementById('search-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = form.querySelector('input').value.trim();
      window.location.href = 'catalog.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ---- Request ("Оставить заявку") ---- */
  function openRequest() {
    var m = document.getElementById('request-modal'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true);
    setTimeout(function () { var i = m.querySelector('input'); if (i) i.focus(); }, 120);
  }
  function closeRequest() { var m = document.getElementById('request-modal'); if (!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); maybeUnlock(); }
  function initRequestForm() {
    var form = document.getElementById('request-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (B.clearFormErrors) B.clearFormErrors(form);
      var name = form['rq-name'].value.trim();
      var phone = form['rq-phone'].value.trim();
      var ok = true;
      if (name.length < 2) { B.setFieldError(form, 'rq-name', 'Введите имя'); ok = false; }
      if (phone.replace(/\D/g, '').length < 10) { B.setFieldError(form, 'rq-phone', 'Введите корректный телефон'); ok = false; }
      if (!ok) return;
      form.reset();
      closeRequest();
      toast('Заявка отправлена. Мы скоро свяжемся с вами!');
    });
  }

  function maybeUnlock() {
    var anyOpen = document.querySelector('.drawer.is-open, .modal.is-open, .mobile-menu.is-open');
    if (!anyOpen) lockScroll(false);
  }

  /* ---------------- Toasts ---------------- */
  function toast(message, icon) {
    var wrap = document.getElementById('toast-wrap');
    if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = svg(icon || 'check', 20) + '<span>' + esc(message) + '</span>';
    wrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-in'); });
    setTimeout(function () {
      el.classList.remove('is-in');
      setTimeout(function () { el.remove(); }, 400);
    }, 2600);
  }

  /* ---------------- Scroll reveal ---------------- */
  var observer;
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .product-card').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); observer.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    observeAll(document);
  }
  function observeAll(scope) {
    if (!observer) { (scope.querySelectorAll('.reveal, .product-card') || []).forEach(function (el) { el.classList.add('is-in'); }); return; }
    scope.querySelectorAll('.reveal, .product-card').forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 9, 6) * 60 + 'ms';
      observer.observe(el);
    });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  /* ---------------- Public UI API ---------------- */
  B.ui = {
    mount: mount, toast: toast, esc: esc,
    openCart: openCart, closeCart: closeCart, renderCart: renderCart,
    openModal: openModal, closeModal: closeModal,
    observe: observeAll, refreshBadges: refreshBadges
  };

  document.addEventListener('DOMContentLoaded', mount);

})(window.Bellico);
