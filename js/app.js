/* ============================================================
   BELLICO — Page bootstrap
   Dispatches per-page initialisers based on <body data-page>.
   ============================================================ */
(function (B) {
  'use strict';

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault(); B.clearFormErrors(form);
      var name = form['cf-name'].value.trim();
      var email = form['cf-email'].value.trim();
      var message = form['cf-message'].value.trim();
      var ok = true;
      if (name.length < 2) { B.setFieldError(form, 'cf-name', 'Введите имя'); ok = false; }
      if (!B.validateEmail(email)) { B.setFieldError(form, 'cf-email', 'Введите корректный email'); ok = false; }
      if (message.length < 5) { B.setFieldError(form, 'cf-message', 'Напишите сообщение'); ok = false; }
      if (!form['cf-agree-pd'].checked) {
        var group = form.querySelector('#cf-consent-group');
        group.classList.add('has-error');
        group.querySelector('.field__error').textContent = 'Подтвердите согласие на обработку данных';
        ok = false;
      }
      if (!ok) return;
      form.reset();
      B.ui.toast('Сообщение отправлено. Мы скоро свяжемся с вами!');
    });
  }

  function boot() {
    var page = document.body.getAttribute('data-page');
    if (page === 'home' && B.shop) B.shop.initHome();
    if (page === 'catalog' && B.shop) B.shop.initCatalog();
    if (page === 'account' && B.account) B.account.initAccount();
    if (page === 'checkout' && B.checkout) B.checkout.initCheckout();
    if (page === 'contacts') initContactForm();
  }

  /* run after chrome (components.js) has mounted */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})(window.Bellico);
