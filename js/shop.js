/* ============================================================
   BELLICO — Catalogue rendering & product modal
   Product cards, grid + "Показать ещё", filtering / sorting /
   search, and the quick-view modal with instant variant switch.
   ============================================================ */
window.Bellico = window.Bellico || {};

(function (B) {
  'use strict';
  var store = B.store, ui = B.ui, esc = B.ui ? B.ui.esc : function (s) { return s; };

  /* ---------------- Product card ---------------- */
  function priceHTML(v) {
    var old = v.oldPrice ? '<del>' + B.formatPrice(v.oldPrice) + '</del>' : '';
    return old + B.formatPrice(v.price);
  }
  function swatchDots(p) {
    if (p.variants.length < 2) return '';
    return '<div class="product-card__swatches">' + p.variants.map(function (v) {
      return '<span class="swatch-dot" style="background:' + v.swatch + '" title="' + esc(v.label) + '"></span>';
    }).join('') + '</div>';
  }
  function cardHTML(p) {
    var v = p.variants[0];
    var fav = store.favorites.has(p.id) ? ' is-active' : '';
    var badge = p.badge ? '<span class="product-card__badge">' + esc(p.badge) + '</span>' : '';
    return '' +
    '<article class="product-card" data-product="' + p.id + '" tabindex="0" role="button" aria-label="' + esc(p.name) + ' — открыть карточку">' +
      '<div class="product-card__media">' +
        badge +
        '<button class="fav-btn' + fav + '" data-fav="' + p.id + '" aria-label="В избранное" aria-pressed="' + (fav ? 'true' : 'false') + '">' +
          B.icon('heart', 19) + '</button>' +
        '<img class="product-card__img" src="' + v.gallery[0] + '" alt="' + esc(p.name + ' — ' + v.label) + '" loading="lazy">' +
        '<div class="product-card__overlay"><span class="product-card__more">Подробнее ' + B.icon('arrow', 16) + '</span></div>' +
      '</div>' +
      '<div class="product-card__info">' +
        '<div>' +
          '<div class="product-card__cat">' + esc(p.category) + '</div>' +
          '<h3 class="product-card__name">' + esc(p.name) + '</h3>' +
        '</div>' +
        '<div class="product-card__price">' + priceHTML(v) + '</div>' +
      '</div>' +
      swatchDots(p) +
    '</article>';
  }

  /* ---------------- Grid with pagination ---------------- */
  function mountGrid(gridEl, moreWrapEl, pageSize) {
    pageSize = pageSize || 9;
    var list = [], shown = pageSize;

    function render() {
      gridEl.innerHTML = list.slice(0, shown).map(cardHTML).join('');
      ui.observe(gridEl);
      if (moreWrapEl) {
        if (shown < list.length) {
          moreWrapEl.innerHTML = '<button class="btn btn--ghost btn--lg" id="' + moreWrapEl.id + '-btn">Показать ещё ' +
            B.icon('chevron', 16) + '</button>';
          moreWrapEl.querySelector('button').addEventListener('click', function () {
            shown += pageSize; render();
          });
        } else { moreWrapEl.innerHTML = ''; }
      }
    }
    return {
      set: function (newList, resetPage) { list = newList; if (resetPage) shown = pageSize; render(); return list.length; },
      render: render
    };
  }

  /* delegate card open + favourite toggle (attached once) */
  document.addEventListener('click', function (e) {
    var fav = e.target.closest('[data-fav]');
    if (fav) {
      e.preventDefault(); e.stopPropagation();
      var id = fav.getAttribute('data-fav');
      var active = store.favorites.toggle(id);
      fav.classList.toggle('is-active', active);
      fav.setAttribute('aria-pressed', active ? 'true' : 'false');
      ui.toast(active ? 'Добавлено в избранное' : 'Удалено из избранного', 'heart');
      return;
    }
    var card = e.target.closest('[data-product]');
    if (card) { openProduct(card.getAttribute('data-product')); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest && e.target.closest('.product-card[data-product]');
    if (card && document.activeElement === card) { e.preventDefault(); openProduct(card.getAttribute('data-product')); }
  });

  /* ---------------- Product modal ---------------- */
  function openProduct(productId, variantId) {
    var p = B.findProduct(productId);
    if (!p) return;
    var current = variantId ? B.findVariant(productId, variantId) : p.variants[0];
    var node = document.createElement('div');
    node.className = 'modal__grid';

    node.innerHTML =
      '<div class="gallery">' +
        '<div class="gallery__main"><img id="m-main" src="' + current.gallery[0] + '" alt="' + esc(p.name) + '"></div>' +
        '<div class="gallery__thumbs" id="m-thumbs"></div>' +
      '</div>' +
      '<div class="modal__body">' +
        '<div class="modal__cat">' + esc(p.category) + '</div>' +
        '<h2 class="modal__title" id="m-title">' + esc(p.name) + '</h2>' +
        '<div class="modal__price" id="m-price"></div>' +
        '<p class="modal__desc" id="m-desc"></p>' +
        '<div class="variants" id="m-variants"></div>' +
        '<div id="m-specs"></div>' +
        '<div class="modal__buy">' +
          '<div class="qty">' +
            '<button type="button" id="m-minus" aria-label="Уменьшить количество">−</button>' +
            '<input id="m-qty" type="text" value="1" inputmode="numeric" aria-label="Количество">' +
            '<button type="button" id="m-plus" aria-label="Увеличить количество">+</button>' +
          '</div>' +
          '<button class="btn" id="m-add">В корзину</button>' +
        '</div>' +
        '<button class="btn btn--accent btn--block" id="m-buy">Купить сейчас</button>' +
        '<button class="btn btn--ghost btn--block" id="m-fav" style="margin-top:10px;">' + B.icon('heart', 18) + '<span></span></button>' +
        '<div class="modal__note">' + B.icon('truck', 18) + '<span>Бесплатная доставка по Москве · Изготовление 4–6 недель</span></div>' +
      '</div>';

    ui.openModal(node);

    var qtyInput = node.querySelector('#m-qty');

    function renderVariants() {
      var box = node.querySelector('#m-variants');
      if (p.variants.length < 2) { box.innerHTML = ''; return; }
      box.innerHTML = '<div class="modal__section-title">Другие варианты</div><div class="variants__grid">' +
        p.variants.map(function (v) {
          var active = v.id === current.id ? ' is-active' : '';
          return '<button type="button" class="variant-card' + active + '" data-variant="' + v.id + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
            '<img class="variant-card__swatch" src="' + v.gallery[0] + '" alt="' + esc(v.label) + '">' +
            '<span class="variant-card__label"><b>' + esc(v.label) + '</b><small>' + B.formatPrice(v.price) + '</small></span>' +
          '</button>';
        }).join('') + '</div>';
      box.querySelectorAll('[data-variant]').forEach(function (btn) {
        btn.addEventListener('click', function () { setVariant(btn.getAttribute('data-variant')); });
      });
    }

    function renderThumbs() {
      var box = node.querySelector('#m-thumbs');
      box.innerHTML = current.gallery.map(function (src, i) {
        return '<button type="button" class="gallery__thumb' + (i === 0 ? ' is-active' : '') + '" data-thumb="' + i + '">' +
          '<img src="' + src + '" alt="' + esc(p.name + ' вид ' + (i + 1)) + '"></button>';
      }).join('');
      box.querySelectorAll('[data-thumb]').forEach(function (t) {
        t.addEventListener('click', function () {
          var i = +t.getAttribute('data-thumb');
          node.querySelector('#m-main').src = current.gallery[i];
          box.querySelectorAll('.gallery__thumb').forEach(function (x) { x.classList.remove('is-active'); });
          t.classList.add('is-active');
        });
      });
    }

    function renderSpecs() {
      var rows = Object.keys(current.specs).map(function (k) {
        return '<div class="specs__row"><dt>' + esc(k) + '</dt><dd>' + esc(current.specs[k]) + '</dd></div>';
      }).join('');
      node.querySelector('#m-specs').innerHTML =
        '<div class="modal__section-title">Характеристики</div><dl class="specs">' + rows + '</dl>';
    }

    function renderFav() {
      var btn = node.querySelector('#m-fav');
      var active = store.favorites.has(p.id);
      btn.classList.toggle('is-active', active);
      btn.querySelector('span').textContent = active ? 'В избранном' : 'В избранное';
      btn.style.color = active ? 'var(--danger)' : '';
    }

    function setVariant(vId) {
      current = B.findVariant(p.id, vId);
      node.querySelector('#m-price').innerHTML = priceHTML(current);
      node.querySelector('#m-desc').textContent = current.desc;
      node.querySelector('#m-main').src = current.gallery[0];
      renderThumbs(); renderVariants(); renderSpecs();
    }

    function getQty() { var n = parseInt(qtyInput.value, 10); return isNaN(n) || n < 1 ? 1 : n; }

    node.querySelector('#m-minus').addEventListener('click', function () { qtyInput.value = Math.max(1, getQty() - 1); });
    node.querySelector('#m-plus').addEventListener('click', function () { qtyInput.value = getQty() + 1; });
    qtyInput.addEventListener('input', function () { qtyInput.value = qtyInput.value.replace(/[^0-9]/g, ''); });
    qtyInput.addEventListener('blur', function () { qtyInput.value = getQty(); });

    node.querySelector('#m-add').addEventListener('click', function () {
      store.cart.add(p.id, current.id, getQty());
      ui.toast('«' + p.name + '» добавлен в корзину');
      ui.closeModal(); ui.openCart();
    });
    node.querySelector('#m-buy').addEventListener('click', function () {
      store.cart.add(p.id, current.id, getQty());
      window.location.href = 'checkout.html';
    });
    node.querySelector('#m-fav').addEventListener('click', function () {
      store.favorites.toggle(p.id); renderFav();
    });

    /* initial paint */
    node.querySelector('#m-price').innerHTML = priceHTML(current);
    node.querySelector('#m-desc').textContent = current.desc;
    renderThumbs(); renderVariants(); renderSpecs(); renderFav();
  }
  B.openProduct = openProduct;

  /* ---------------- Home (featured) ---------------- */
  function initHome() {
    var grid = document.getElementById('featured-grid');
    if (!grid) return;
    var more = document.getElementById('featured-more');
    var g = mountGrid(grid, more, 9);
    g.set(B.products.slice(), true);
  }

  /* ---------------- Catalogue page ---------------- */
  function initCatalog() {
    var grid = document.getElementById('catalog-grid');
    if (!grid) return;
    var more = document.getElementById('catalog-more');
    var countEl = document.getElementById('result-count');
    var searchEl = document.getElementById('cat-search');
    var sortEl = document.getElementById('cat-sort');
    var chipsEl = document.getElementById('cat-filters');

    var params = new URLSearchParams(window.location.search);
    var state = { q: params.get('q') || '', cat: params.get('cat') || 'Все', sort: 'popular' };
    if (searchEl) searchEl.value = state.q;

    /* chips */
    chipsEl.innerHTML = B.categories.map(function (c) {
      return '<button class="chip' + (c === state.cat ? ' is-active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');
    chipsEl.querySelectorAll('[data-cat]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.cat = chip.getAttribute('data-cat');
        chipsEl.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        apply();
      });
    });

    var g = mountGrid(grid, more, 9);

    function filtered() {
      var q = state.q.trim().toLowerCase();
      var list = B.products.filter(function (p) {
        if (state.cat !== 'Все' && p.category !== state.cat) return false;
        if (!q) return true;
        var hay = (p.name + ' ' + p.category + ' ' + p.variants.map(function (v) { return v.label; }).join(' ')).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      var by = { 'price-asc': function (a, b) { return a.variants[0].price - b.variants[0].price; },
                 'price-desc': function (a, b) { return b.variants[0].price - a.variants[0].price; },
                 'name': function (a, b) { return a.name.localeCompare(b.name, 'ru'); } };
      if (by[state.sort]) list = list.slice().sort(by[state.sort]);
      return list;
    }
    function apply() {
      var n = g.set(filtered(), true);
      if (countEl) countEl.textContent = n ? 'Найдено товаров: ' + n : '';
      if (!n) grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><h3>Ничего не найдено</h3>' +
        '<p>Попробуйте изменить запрос или выбрать другую категорию.</p></div>';
    }

    if (searchEl) searchEl.addEventListener('input', function () { state.q = searchEl.value; apply(); });
    if (sortEl) sortEl.addEventListener('change', function () { state.sort = sortEl.value; apply(); });

    apply();
  }

  B.shop = { initHome: initHome, initCatalog: initCatalog, cardHTML: cardHTML, openProduct: openProduct };

})(window.Bellico);
