/* ============================================================
   BELLICO — Client-side store (localStorage + pub/sub)
   Cart, favourites, auth, addresses and orders.
   NOTE: this is a front-end demo store. Passwords are kept only
   in localStorage and must NOT be treated as secure — swap this
   module for a real API/auth backend in production.
   ============================================================ */
window.Bellico = window.Bellico || {};

(function (B) {
  'use strict';

  var KEYS = {
    cart: 'bellico.cart',
    fav: 'bellico.favorites',
    users: 'bellico.users',
    session: 'bellico.session'
  };

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  /* ---- pub/sub ---- */
  var subs = {};
  function on(evt, cb) { (subs[evt] = subs[evt] || []).push(cb); return function () { subs[evt] = subs[evt].filter(function (f) { return f !== cb; }); }; }
  function emit(evt) { (subs[evt] || []).forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } }); }

  /* ---- formatting ---- */
  var nf = new Intl.NumberFormat('ru-RU');
  function formatPrice(n) { return nf.format(Math.round(n)) + ' ₽'; }
  B.formatPrice = formatPrice;

  /* ================= CART ================= */
  function cartKey(productId, variantId) { return productId + '|' + variantId; }

  var Cart = {
    items: function () { return read(KEYS.cart, []); },
    save: function (items) { write(KEYS.cart, items); emit('cart'); },
    add: function (productId, variantId, qty) {
      qty = Math.max(1, qty || 1);
      var items = Cart.items();
      var key = cartKey(productId, variantId);
      var existing = items.find(function (i) { return i.key === key; });
      if (existing) existing.qty += qty;
      else items.push({ key: key, productId: productId, variantId: variantId, qty: qty });
      Cart.save(items);
    },
    setQty: function (key, qty) {
      var items = Cart.items();
      var it = items.find(function (i) { return i.key === key; });
      if (!it) return;
      it.qty = Math.max(1, qty);
      Cart.save(items);
    },
    remove: function (key) {
      Cart.save(Cart.items().filter(function (i) { return i.key !== key; }));
    },
    clear: function () { Cart.save([]); },
    count: function () { return Cart.items().reduce(function (s, i) { return s + i.qty; }, 0); },
    /* resolve cart entries to rich rows (product, variant, line total) */
    detailed: function () {
      return Cart.items().map(function (i) {
        var p = B.findProduct(i.productId);
        var v = p ? B.findVariant(i.productId, i.variantId) : null;
        return { key: i.key, qty: i.qty, product: p, variant: v,
          lineTotal: v ? v.price * i.qty : 0 };
      }).filter(function (r) { return r.product && r.variant; });
    },
    total: function () { return Cart.detailed().reduce(function (s, r) { return s + r.lineTotal; }, 0); }
  };

  /* ================= FAVOURITES ================= */
  var Fav = {
    list: function () { return read(KEYS.fav, []); },
    has: function (id) { return Fav.list().indexOf(id) !== -1; },
    toggle: function (id) {
      var list = Fav.list();
      var i = list.indexOf(id);
      if (i === -1) list.push(id); else list.splice(i, 1);
      write(KEYS.fav, list); emit('favorites');
      return list.indexOf(id) !== -1;
    },
    count: function () { return Fav.list().length; }
  };

  /* ================= AUTH / USERS ================= */
  function users() { return read(KEYS.users, []); }
  function saveUsers(u) { write(KEYS.users, u); }

  var Auth = {
    current: function () {
      var email = read(KEYS.session, null);
      if (!email) return null;
      var u = users().find(function (x) { return x.email === email; });
      if (!u) return null;
      return { name: u.name, email: u.email, phone: u.phone, addresses: u.addresses || [], orders: u.orders || [] };
    },
    register: function (data) {
      var all = users();
      if (all.some(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); })) {
        return { ok: false, error: 'Пользователь с таким email уже зарегистрирован' };
      }
      all.push({ name: data.name, email: data.email, phone: data.phone, password: data.password, addresses: [], orders: [] });
      saveUsers(all);
      write(KEYS.session, data.email);
      emit('auth');
      return { ok: true };
    },
    login: function (email, password) {
      var u = users().find(function (x) { return x.email.toLowerCase() === email.toLowerCase(); });
      if (!u || u.password !== password) return { ok: false, error: 'Неверный email или пароль' };
      write(KEYS.session, u.email);
      emit('auth');
      return { ok: true };
    },
    logout: function () { localStorage.removeItem(KEYS.session); emit('auth'); },
    isAuthed: function () { return !!Auth.current(); },
    /* mutate the current user record */
    update: function (patch) {
      var email = read(KEYS.session, null);
      if (!email) return;
      var all = users();
      var u = all.find(function (x) { return x.email === email; });
      if (!u) return;
      Object.assign(u, patch);
      if (patch.email && patch.email !== email) write(KEYS.session, patch.email);
      saveUsers(all);
      emit('auth');
    },
    addAddress: function (addr) {
      var u = Auth.current(); if (!u) return;
      var list = u.addresses.slice();
      addr.id = 'a' + Date.now();
      list.push(addr);
      Auth.update({ addresses: list });
    },
    removeAddress: function (id) {
      var u = Auth.current(); if (!u) return;
      Auth.update({ addresses: u.addresses.filter(function (a) { return a.id !== id; }) });
    },
    addOrder: function (order) {
      var u = Auth.current(); if (!u) return;
      var list = u.orders.slice();
      list.unshift(order);
      Auth.update({ orders: list });
    }
  };

  B.store = {
    KEYS: KEYS, on: on, emit: emit,
    cart: Cart, favorites: Fav, auth: Auth
  };

})(window.Bellico);
