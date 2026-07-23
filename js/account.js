/* ============================================================
   BELLICO — Account: auth + personal dashboard
   ============================================================ */
window.Bellico = window.Bellico || {};

(function (B) {
  'use strict';
  var store = B.store, ui = B.ui, esc = B.ui.esc;

  /* ---- shared validation helpers ---- */
  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function field(name, label, type, opts) {
    opts = opts || {};
    var t = type || 'text';
    var input = '<input class="input" id="' + name + '" name="' + name + '" type="' + t + '" ' +
      (opts.value ? 'value="' + esc(opts.value) + '" ' : '') +
      (opts.placeholder ? 'placeholder="' + esc(opts.placeholder) + '" ' : '') +
      (opts.autocomplete ? 'autocomplete="' + opts.autocomplete + '" ' : '') + '>';
    return '<div class="field' + (opts.span2 ? ' span-2' : '') + '">' +
      '<label for="' + name + '">' + esc(label) + (opts.required ? ' <span class="req">*</span>' : '') + '</label>' +
      input + '<div class="field__error"></div></div>';
  }
  function setError(form, name, msg) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return; var f = el.closest('.field'); f.classList.add('has-error');
    var e = f.querySelector('.field__error'); if (e) e.textContent = msg;
  }
  function clearErrors(form) { form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('has-error'); }); }
  B.validateEmail = function (v) { return RE_EMAIL.test(v); };
  B.formField = field; B.setFieldError = setError; B.clearFormErrors = clearErrors;

  /* ============== AUTH VIEW ============== */
  function renderAuth(root, mode) {
    mode = mode || 'login';
    root.innerHTML =
      '<div class="auth-wrap">' +
        '<div class="card card--pad-lg">' +
          '<div class="auth-tabs">' +
            '<button data-tab="login" class="' + (mode === 'login' ? 'is-active' : '') + '">Вход</button>' +
            '<button data-tab="register" class="' + (mode === 'register' ? 'is-active' : '') + '">Регистрация</button>' +
          '</div>' +
          '<div id="auth-body"></div>' +
        '</div>' +
      '</div>';
    root.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () { renderAuth(root, b.getAttribute('data-tab')); });
    });
    var body = root.querySelector('#auth-body');
    if (mode === 'login') renderLogin(root, body); else renderRegister(root, body);
  }

  function renderLogin(root, body) {
    body.innerHTML =
      '<form id="login-form" novalidate>' +
        field('login-email', 'Email', 'email', { required: true, placeholder: 'you@example.com', autocomplete: 'email' }) +
        field('login-password', 'Пароль', 'password', { required: true, placeholder: '••••••••', autocomplete: 'current-password' }) +
        '<button class="btn btn--block btn--lg" type="submit">Войти</button>' +
        '<p class="form-aside">Нет аккаунта? <a href="#" data-go="register">Зарегистрироваться</a></p>' +
      '</form>';
    body.querySelector('[data-go="register"]').addEventListener('click', function (e) { e.preventDefault(); renderAuth(root, 'register'); });
    var form = body.querySelector('#login-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors(form);
      var email = form['login-email'].value.trim();
      var pass = form['login-password'].value;
      var ok = true;
      if (!RE_EMAIL.test(email)) { setError(form, 'login-email', 'Введите корректный email'); ok = false; }
      if (!pass) { setError(form, 'login-password', 'Введите пароль'); ok = false; }
      if (!ok) return;
      var res = store.auth.login(email, pass);
      if (!res.ok) { setError(form, 'login-password', res.error); return; }
      ui.toast('С возвращением!'); renderDashboard(root);
    });
  }

  function renderRegister(root, body) {
    body.innerHTML =
      '<form id="reg-form" novalidate>' +
        field('reg-name', 'Имя', 'text', { required: true, placeholder: 'Анна', autocomplete: 'name' }) +
        field('reg-email', 'Email', 'email', { required: true, placeholder: 'you@example.com', autocomplete: 'email' }) +
        field('reg-phone', 'Телефон', 'tel', { required: true, placeholder: '+7 (___) ___-__-__', autocomplete: 'tel' }) +
        field('reg-password', 'Пароль', 'password', { required: true, placeholder: 'Минимум 6 символов', autocomplete: 'new-password' }) +
        '<label class="checkbox" style="margin:6px 0 10px;"><input type="checkbox" id="reg-agree"> ' +
          '<span>Даю согласие на <a href="privacy.html" target="_blank">обработку персональных данных</a></span></label>' +
        '<label class="checkbox" style="margin:0 0 18px;"><input type="checkbox" id="reg-marketing"> ' +
          '<span>Хочу получать на email информацию об акциях и новинках (необязательно)</span></label>' +
        '<button class="btn btn--block btn--lg" type="submit">Создать аккаунт</button>' +
        '<p class="form-aside">Уже есть аккаунт? <a href="#" data-go="login">Войти</a></p>' +
      '</form>';
    body.querySelector('[data-go="login"]').addEventListener('click', function (e) { e.preventDefault(); renderAuth(root, 'login'); });
    var form = body.querySelector('#reg-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors(form);
      var name = form['reg-name'].value.trim();
      var email = form['reg-email'].value.trim();
      var phone = form['reg-phone'].value.trim();
      var pass = form['reg-password'].value;
      var ok = true;
      if (name.length < 2) { setError(form, 'reg-name', 'Введите имя'); ok = false; }
      if (!RE_EMAIL.test(email)) { setError(form, 'reg-email', 'Введите корректный email'); ok = false; }
      if (phone.replace(/\D/g, '').length < 10) { setError(form, 'reg-phone', 'Введите корректный телефон'); ok = false; }
      if (pass.length < 6) { setError(form, 'reg-password', 'Минимум 6 символов'); ok = false; }
      if (!form['reg-agree'] || !document.getElementById('reg-agree').checked) { ui.toast('Подтвердите согласие на обработку данных', 'info'); ok = false; }
      if (!ok) return;
      var marketingConsent = document.getElementById('reg-marketing').checked;
      var res = store.auth.register({ name: name, email: email, phone: phone, password: pass, marketingConsent: marketingConsent });
      if (!res.ok) { setError(form, 'reg-email', res.error); return; }
      ui.toast('Аккаунт создан. Добро пожаловать!'); renderDashboard(root);
    });
  }

  /* ============== DASHBOARD ============== */
  var TABS = [
    { id: 'profile', label: 'Профиль', icon: 'user' },
    { id: 'orders', label: 'История заказов', icon: 'box' },
    { id: 'favorites', label: 'Избранное', icon: 'heart' },
    { id: 'addresses', label: 'Адреса доставки', icon: 'pin' },
    { id: 'settings', label: 'Настройки аккаунта', icon: 'gear' }
  ];

  function renderDashboard(root, activeTab) {
    var u = store.auth.current();
    if (!u) { renderAuth(root, 'login'); return; }
    var hash = (window.location.hash || '').replace('#', '');
    activeTab = activeTab || (TABS.some(function (t) { return t.id === hash; }) ? hash : 'profile');

    root.innerHTML =
      '<div class="dash">' +
        '<aside class="dash__nav">' +
          '<div class="dash__user">' +
            '<div class="dash__avatar">' + esc((u.name || 'U').charAt(0).toUpperCase()) + '</div>' +
            '<b>' + esc(u.name) + '</b><small>' + esc(u.email) + '</small>' +
          '</div>' +
          TABS.map(function (t) {
            return '<button data-tab="' + t.id + '" class="' + (t.id === activeTab ? 'is-active' : '') + '">' +
              B.icon(t.icon, 18) + t.label + '</button>';
          }).join('') +
          '<button class="logout" data-logout>' + B.icon('arrow', 18) + 'Выйти</button>' +
        '</aside>' +
        '<div class="dash__panel" id="dash-panel"></div>' +
      '</div>';

    root.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-tab]').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        renderPanel(root, b.getAttribute('data-tab'));
      });
    });
    root.querySelector('[data-logout]').addEventListener('click', function () {
      store.auth.logout(); ui.toast('Вы вышли из аккаунта'); renderAuth(root, 'login');
    });
    renderPanel(root, activeTab);
  }

  function renderPanel(root, tab) {
    var panel = root.querySelector('#dash-panel');
    var u = store.auth.current();
    if (tab === 'profile') return panelProfile(panel, u, root);
    if (tab === 'orders') return panelOrders(panel, u);
    if (tab === 'favorites') return panelFavorites(panel);
    if (tab === 'addresses') return panelAddresses(panel, root);
    if (tab === 'settings') return panelSettings(panel, u, root);
  }

  function panelProfile(panel, u, root) {
    panel.innerHTML =
      '<h2 class="panel__title">Профиль</h2>' +
      '<div class="card">' +
        '<div class="info-row"><span>Имя</span><b>' + esc(u.name) + '</b></div>' +
        '<div class="info-row"><span>Email</span><b>' + esc(u.email) + '</b></div>' +
        '<div class="info-row"><span>Телефон</span><b>' + esc(u.phone || '—') + '</b></div>' +
        '<div class="info-row"><span>Заказов оформлено</span><b>' + u.orders.length + '</b></div>' +
        '<div class="info-row" style="border:none;"><span>Товаров в избранном</span><b>' + store.favorites.count() + '</b></div>' +
      '</div>' +
      '<div style="margin-top:20px;"><button class="btn btn--ghost" data-edit>Редактировать данные</button></div>';
    panel.querySelector('[data-edit]').addEventListener('click', function () { renderDashboard(root, 'settings'); window.location.hash = 'settings'; });
  }

  function panelOrders(panel, u) {
    if (!u.orders.length) {
      panel.innerHTML = '<h2 class="panel__title">История заказов</h2>' +
        '<div class="empty-state"><h3>Заказов пока нет</h3><p>Оформите первый заказ — он появится здесь.</p>' +
        '<a class="btn" href="catalog.html" style="margin-top:18px;">Перейти в каталог</a></div>';
      return;
    }
    panel.innerHTML = '<h2 class="panel__title">История заказов</h2>' + u.orders.map(function (o) {
      return '<div class="order-card">' +
        '<div class="order-card__head">' +
          '<div><h4>Заказ ' + esc(o.id) + '</h4><small>' + esc(o.date) + ' · ' + esc(o.payment) + '</small></div>' +
          '<span class="status">' + esc(o.status) + '</span>' +
        '</div>' +
        o.items.map(function (it) {
          return '<div class="order-line"><img src="' + it.img + '" alt="' + esc(it.name) + '">' +
            '<div class="ol-name">' + esc(it.name) + '<br><small class="muted">' + esc(it.variant) + ' · ' + it.qty + ' шт.</small></div>' +
            '<b>' + B.formatPrice(it.price * it.qty) + '</b></div>';
        }).join('') +
        '<div class="order-card__total">Итого: ' + B.formatPrice(o.total) + '</div>' +
      '</div>';
    }).join('');
  }

  function panelFavorites(panel) {
    var ids = store.favorites.list();
    var products = ids.map(function (id) { return B.findProduct(id); }).filter(Boolean);
    if (!products.length) {
      panel.innerHTML = '<h2 class="panel__title">Избранное</h2>' +
        '<div class="empty-state"><h3>В избранном пусто</h3><p>Нажимайте на сердечко на карточках товаров, чтобы сохранить их здесь.</p>' +
        '<a class="btn" href="catalog.html" style="margin-top:18px;">Перейти в каталог</a></div>';
      return;
    }
    panel.innerHTML = '<h2 class="panel__title">Избранное</h2><div class="fav-grid" id="fav-grid"></div>';
    var grid = panel.querySelector('#fav-grid');
    grid.innerHTML = products.map(function (p) { return B.shop.cardHTML(p); }).join('');
    ui.observe(grid);
    /* keep list fresh when user un-favourites from here */
    store.on('favorites', function () {
      if (document.body.contains(grid)) panelFavorites(panel);
    });
  }

  function panelAddresses(panel, root) {
    var u = store.auth.current();
    var list = u.addresses.length ? u.addresses.map(function (a) {
      return '<div class="address-card">' +
        '<button class="address-card__del" data-del="' + a.id + '">Удалить</button>' +
        '<h4>' + esc(a.title || 'Адрес') + '</h4>' +
        '<p>' + esc(a.city) + ', ' + esc(a.street) + '</p>' +
        '<p class="muted">' + esc(a.recipient || u.name) + ' · ' + esc(a.phone || u.phone || '') + '</p>' +
      '</div>';
    }).join('') : '<div class="empty-state" style="padding:40px 0;"><p>Сохранённых адресов пока нет.</p></div>';

    panel.innerHTML = '<h2 class="panel__title">Адреса доставки</h2>' + list +
      '<div class="card" style="margin-top:24px;"><h3 style="font-size:1.2rem;margin-bottom:18px;font-family:var(--font-serif);">Добавить адрес</h3>' +
        '<form id="addr-form" novalidate>' +
          '<div class="form-grid">' +
            field('addr-title', 'Название', 'text', { placeholder: 'Дом, офис…' }) +
            field('addr-city', 'Город', 'text', { required: true, placeholder: 'Москва' }) +
            field('addr-street', 'Улица, дом, квартира', 'text', { required: true, span2: true, placeholder: 'ул. Пример, 1, кв. 2' }) +
          '</div>' +
          '<button class="btn" type="submit">Сохранить адрес</button>' +
        '</form>' +
      '</div>';

    panel.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () { store.auth.removeAddress(b.getAttribute('data-del')); ui.toast('Адрес удалён'); panelAddresses(panel, root); });
    });
    var form = panel.querySelector('#addr-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors(form);
      var city = form['addr-city'].value.trim(), street = form['addr-street'].value.trim();
      var ok = true;
      if (!city) { setError(form, 'addr-city', 'Укажите город'); ok = false; }
      if (!street) { setError(form, 'addr-street', 'Укажите адрес'); ok = false; }
      if (!ok) return;
      store.auth.addAddress({ title: form['addr-title'].value.trim() || 'Адрес', city: city, street: street });
      ui.toast('Адрес сохранён'); panelAddresses(panel, root);
    });
  }

  function panelSettings(panel, u, root) {
    panel.innerHTML =
      '<h2 class="panel__title">Настройки аккаунта</h2>' +
      '<div class="card">' +
        '<form id="set-form" novalidate>' +
          '<div class="form-grid">' +
            field('set-name', 'Имя', 'text', { required: true, value: u.name }) +
            field('set-phone', 'Телефон', 'tel', { value: u.phone }) +
            field('set-email', 'Email', 'email', { required: true, value: u.email, span2: true }) +
          '</div>' +
          '<button class="btn" type="submit">Сохранить изменения</button>' +
        '</form>' +
      '</div>' +
      '<div class="card" style="margin-top:20px;">' +
        '<h3 style="font-size:1.2rem;margin-bottom:18px;font-family:var(--font-serif);">Смена пароля</h3>' +
        '<form id="pass-form" novalidate>' +
          field('pass-new', 'Новый пароль', 'password', { required: true, placeholder: 'Минимум 6 символов' }) +
          '<button class="btn btn--ghost" type="submit">Обновить пароль</button>' +
        '</form>' +
      '</div>';

    var sf = panel.querySelector('#set-form');
    sf.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors(sf);
      var name = sf['set-name'].value.trim(), email = sf['set-email'].value.trim();
      var ok = true;
      if (name.length < 2) { setError(sf, 'set-name', 'Введите имя'); ok = false; }
      if (!RE_EMAIL.test(email)) { setError(sf, 'set-email', 'Введите корректный email'); ok = false; }
      if (!ok) return;
      store.auth.update({ name: name, email: email, phone: sf['set-phone'].value.trim() });
      ui.toast('Данные обновлены'); renderDashboard(root, 'settings');
    });
    var pf = panel.querySelector('#pass-form');
    pf.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrors(pf);
      var np = pf['pass-new'].value;
      if (np.length < 6) { setError(pf, 'pass-new', 'Минимум 6 символов'); return; }
      store.auth.update({ password: np }); pf.reset(); ui.toast('Пароль обновлён');
    });
  }

  /* ============== entry ============== */
  function initAccount() {
    var root = document.getElementById('account-root');
    if (!root) return;
    if (store.auth.isAuthed()) renderDashboard(root); else renderAuth(root, 'login');
    window.addEventListener('hashchange', function () {
      if (store.auth.isAuthed()) {
        var hash = (window.location.hash || '').replace('#', '');
        if (TABS.some(function (t) { return t.id === hash; })) renderDashboard(root, hash);
      }
    });
  }

  B.account = { initAccount: initAccount };

})(window.Bellico);
