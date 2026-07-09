/* ============================================================
   BELLICO — Site-wide config
   Edit the values below in ONE place — phone, email, address and
   other shared text update everywhere automatically (footer,
   contacts page, etc). No other file needs to be touched for
   these fields.
   ============================================================ */
window.Bellico = window.Bellico || {};

(function (B) {
  'use strict';

  var config = {
    phone: '+7 (000) 000-00-00',
    email: 'hello@bellico.ru',
    hours: 'Ежедневно, 10:00 — 21:00',
    footerAbout: 'Премиальная мебель для тех, кто ценит спокойную роскошь, натуральные материалы и безупречную форму.',
    social: {
      instagram: '#',
      whatsapp: '#',
      telegram: '#'
    }
  };
  // Clickable hrefs, derived from phone/email above so they stay in sync.
  config.phoneHref = 'tel:' + config.phone.replace(/[^\d+]/g, '');
  config.emailHref = 'mailto:' + config.email;
  B.config = config;

  /* Fills every element marked data-field="phone" / "email" / "address" / "hours"
     with the matching value above. Used on pages like contacts.html.
     If the element is a link (<a>), also sets its href from the matching
     "<field>Href" config entry (e.g. data-field="phone" -> config.phoneHref). */
  function applyConfig() {
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var key = el.getAttribute('data-field');
      if (B.config[key] === undefined) return;
      el.textContent = B.config[key];
      if (el.tagName === 'A' && B.config[key + 'Href']) {
        el.setAttribute('href', B.config[key + 'Href']);
      }
    });
  }
  B.applyConfig = applyConfig;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyConfig);
  } else {
    applyConfig();
  }

})(window.Bellico);
