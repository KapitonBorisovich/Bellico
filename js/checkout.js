/* ============================================================
   BELLICO — Checkout flow
   Contact + delivery form, payment method selection (placeholder
   integrations) and order placement.

   PAYMENT INTEGRATION POINT
   -------------------------
   `PAYMENTS` describes each provider. To go live, implement
   `createPayment(method, order)` for the chosen provider (Bank
   card / СБП / ЮKassa) and redirect to the returned payment URL
   instead of calling `placeOrder()` directly. The UI, order
   object and summary are already wired for this.
   ============================================================ */
window.Bellico = window.Bellico || {};

(function (B) {
  'use strict';
  var store = B.store, ui = B.ui, esc = B.ui.esc;
  var FREE_DELIVERY_FROM = 100000;
  var DELIVERY_COST = 1990;

  var PAYMENTS = [
    { id: 'card', label: 'Банковская карта', desc: 'Visa, Mastercard, МИР', icon: 'card', provider: 'acquiring' },
    { id: 'sbp', label: 'СБП', desc: 'Оплата по QR-коду через банк', icon: 'qr', provider: 'sbp' },
    { id: 'yookassa', label: 'ЮKassa', desc: 'Карты, кошельки, рассрочка', icon: 'wallet', provider: 'yookassa' }
  ];

  /* Placeholder. Replace the body with a real provider call that
     returns a confirmation/redirect URL. Kept here so the rest of
     the flow already speaks the right contract. */
  function createPayment(method, order) {
    /* TODO: integrate acquiring / СБП / ЮKassa here.
       e.g. return fetch('/api/payments', {…}).then(r => r.json()); */
    return Promise.resolve({ status: 'demo', method: method, orderId: order.id });
  }
  B.createPayment = createPayment;

  function deliveryFor(total) { return total >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST; }

  function field(name, label, type, opts) { return B.formField(name, label, type, opts); }

  function summaryHTML(rows, subtotal, delivery) {
    var total = subtotal + delivery;
    return '<div class="card summary">' +
      '<h3 style="font-size:1.4rem;margin-bottom:18px;">Ваш заказ</h3>' +
      '<div class="summary__items">' + rows.map(function (r) {
        return '<div class="summary__item"><img src="' + r.variant.gallery[0] + '" alt="' + esc(r.product.name) + '">' +
          '<div class="si-main"><div class="si-name">' + esc(r.product.name) + '</div>' +
          '<div class="si-qty">' + esc(r.variant.label) + ' · ' + r.qty + ' шт.</div></div>' +
          '<div class="si-price">' + B.formatPrice(r.lineTotal) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="summary__row"><span>Товары</span><span>' + B.formatPrice(subtotal) + '</span></div>' +
      '<div class="summary__row"><span>Доставка</span><span>' + (delivery ? B.formatPrice(delivery) : 'Бесплатно') + '</span></div>' +
      '<div class="summary__row summary__row--total"><span>Итого</span><b>' + B.formatPrice(total) + '</b></div>' +
    '</div>';
  }

  function initCheckout() {
    var root = document.getElementById('checkout-root');
    if (!root) return;

    var rows = store.cart.detailed();
    if (!rows.length) {
      root.innerHTML = '<div class="empty-state"><h3>Корзина пуста</h3>' +
        '<p>Добавьте товары, чтобы оформить заказ.</p>' +
        '<a class="btn" href="catalog.html" style="margin-top:18px;">Перейти в каталог</a></div>';
      return;
    }

    var subtotal = store.cart.total();
    var delivery = deliveryFor(subtotal);
    var u = store.auth.current();
    var selectedPay = 'card';

    root.innerHTML =
      '<div class="checkout-grid">' +
        '<div>' +
          '<form id="checkout-form" novalidate>' +
            /* Step 1 — contacts */
            '<section class="checkout-section">' +
              '<h2 class="checkout-section__title"><span class="checkout-section__num">1</span>Контактные данные</h2>' +
              '<div class="form-grid">' +
                field('co-name', 'Имя', 'text', { required: true, value: u ? u.name : '', autocomplete: 'name' }) +
                field('co-phone', 'Телефон', 'tel', { required: true, value: u ? u.phone : '', placeholder: '+7 (___) ___-__-__', autocomplete: 'tel' }) +
                field('co-email', 'Email', 'email', { required: true, value: u ? u.email : '', span2: true, autocomplete: 'email' }) +
              '</div>' +
            '</section>' +
            /* Step 2 — delivery */
            '<section class="checkout-section">' +
              '<h2 class="checkout-section__title"><span class="checkout-section__num">2</span>Доставка</h2>' +
              field('co-address', 'Адрес доставки', 'text', { required: true, placeholder: 'Город, улица, дом, квартира' }) +
              '<div class="field"><label for="co-comment">Комментарий к заказу</label>' +
                '<textarea class="textarea" id="co-comment" name="co-comment" placeholder="Этаж, домофон, удобное время доставки…"></textarea>' +
                '<div class="field__error"></div></div>' +
            '</section>' +
            /* Step 3 — payment */
            '<section class="checkout-section">' +
              '<h2 class="checkout-section__title"><span class="checkout-section__num">3</span>Оплата</h2>' +
              '<div class="pay-options" id="pay-options">' +
                PAYMENTS.map(function (pm, i) {
                  return '<label class="pay-option' + (i === 0 ? ' is-active' : '') + '" data-pay="' + pm.id + '">' +
                    '<input type="radio" name="payment" value="' + pm.id + '"' + (i === 0 ? ' checked' : '') + '>' +
                    '<span class="pay-option__icon">' + B.icon(pm.icon, 22) + '</span>' +
                    '<span class="pay-option__main"><b>' + esc(pm.label) + '</b><small>' + esc(pm.desc) + '</small></span>' +
                    '<span class="pay-option__tag">Демо</span>' +
                  '</label>';
                }).join('') +
              '</div>' +
              '<div class="demo-note">' + B.icon('info', 20) +
                '<span>Онлайн-оплата работает в демонстрационном режиме. Архитектура готова к подключению эквайринга, СБП и ЮKassa — заказ будет оформлен, а оплата подключается отдельно.</span></div>' +
            '</section>' +
            '<div class="field" id="co-consent-group">' +
              '<label class="checkbox"><input type="checkbox" id="co-agree-oferta" name="co-agree-oferta"> <span>Я согласен с условиями <a href="oferta.html" target="_blank">публичной оферты</a></span></label>' +
              '<label class="checkbox" style="margin-top:10px;"><input type="checkbox" id="co-agree-pd" name="co-agree-pd"> <span>Даю согласие на <a href="privacy.html" target="_blank">обработку персональных данных</a></span></label>' +
              '<div class="field__error"></div>' +
            '</div>' +
            '<label class="checkbox" style="margin:14px 0 20px;"><input type="checkbox" id="co-agree-marketing" name="co-agree-marketing"> <span>Хочу получать на email информацию об акциях и новинках (необязательно)</span></label>' +
            '<button class="btn btn--lg btn--block" type="submit" id="place-order">Подтвердить заказ · ' + B.formatPrice(subtotal + delivery) + '</button>' +
            '<div class="modal__note" style="justify-content:center;margin-top:14px;">' + B.icon('lock', 16) +
              '<span>Ваши данные защищены и используются только для обработки заказа</span></div>' +
          '</form>' +
        '</div>' +
        '<div>' + summaryHTML(rows, subtotal, delivery) + '</div>' +
      '</div>';

    /* payment option selection */
    root.querySelectorAll('[data-pay]').forEach(function (opt) {
      opt.addEventListener('click', function () {
        root.querySelectorAll('.pay-option').forEach(function (o) { o.classList.remove('is-active'); });
        opt.classList.add('is-active');
        selectedPay = opt.getAttribute('data-pay');
      });
    });

    var form = root.querySelector('#checkout-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); B.clearFormErrors(form);
      var name = form['co-name'].value.trim();
      var phone = form['co-phone'].value.trim();
      var email = form['co-email'].value.trim();
      var address = form['co-address'].value.trim();
      var ok = true;
      if (name.length < 2) { B.setFieldError(form, 'co-name', 'Введите имя'); ok = false; }
      if (phone.replace(/\D/g, '').length < 10) { B.setFieldError(form, 'co-phone', 'Введите корректный телефон'); ok = false; }
      if (!B.validateEmail(email)) { B.setFieldError(form, 'co-email', 'Введите корректный email'); ok = false; }
      if (address.length < 5) { B.setFieldError(form, 'co-address', 'Укажите адрес доставки'); ok = false; }
      var consentGroup = form.querySelector('#co-consent-group');
      consentGroup.classList.remove('has-error');
      if (!form['co-agree-oferta'].checked || !form['co-agree-pd'].checked) {
        consentGroup.classList.add('has-error');
        consentGroup.querySelector('.field__error').textContent = 'Подтвердите согласие с офертой и обработкой персональных данных';
        ok = false;
      }
      if (!ok) { var firstErr = form.querySelector('.has-error'); if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

      var payLabel = (PAYMENTS.find(function (p) { return p.id === selectedPay; }) || PAYMENTS[0]).label;
      var order = {
        id: 'BL-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }),
        items: rows.map(function (r) { return { name: r.product.name, variant: r.variant.label, qty: r.qty, price: r.variant.price, img: r.variant.gallery[0] }; }),
        subtotal: subtotal, delivery: delivery, total: subtotal + delivery,
        payment: payLabel, address: address, name: name, phone: phone, email: email,
        comment: form['co-comment'].value.trim(), status: 'Принят в обработку',
        marketingConsent: form['co-agree-marketing'].checked
      };

      var btn = root.querySelector('#place-order');
      btn.setAttribute('aria-disabled', 'true'); btn.textContent = 'Оформляем…';

      /* payment provider would be invoked here in production */
      createPayment(selectedPay, order).then(function () {
        if (store.auth.isAuthed()) store.auth.addOrder(order);
        store.cart.clear();
        renderSuccess(root, order);
      });
    });
  }

  function renderSuccess(root, order) {
    root.innerHTML =
      '<div class="success-box card">' +
        '<div class="success-box__icon">' + B.icon('check', 40) + '</div>' +
        '<h2 style="font-size:2.2rem;margin-bottom:12px;">Спасибо за заказ!</h2>' +
        '<p class="muted" style="margin-bottom:24px;">Заказ <b style="color:var(--text);">' + esc(order.id) + '</b> успешно оформлен.<br>' +
          'Мы свяжемся с вами по телефону ' + esc(order.phone) + ' для подтверждения.</p>' +
        '<div class="card" style="text-align:left;background:var(--bg-soft);border:none;margin-bottom:24px;">' +
          '<div class="info-row"><span>Способ оплаты</span><b>' + esc(order.payment) + '</b></div>' +
          '<div class="info-row"><span>Адрес доставки</span><b style="text-align:right;max-width:60%;">' + esc(order.address) + '</b></div>' +
          '<div class="info-row" style="border:none;"><span>Сумма заказа</span><b>' + B.formatPrice(order.total) + '</b></div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">' +
          (store.auth.isAuthed() ? '<a class="btn" href="account.html#orders">Мои заказы</a>' : '<a class="btn" href="account.html">Войти в аккаунт</a>') +
          '<a class="btn btn--ghost" href="catalog.html">Продолжить покупки</a>' +
        '</div>' +
      '</div>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    ui.refreshBadges();
  }

  B.checkout = { initCheckout: initCheckout };

})(window.Bellico);
