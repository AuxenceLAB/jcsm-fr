// Garde-fou du formulaire de contact (js/landing.js) : chaque réponse du relais api/site-contact.php
// donne une consigne distincte, annoncée (role=status) et focalisée, sans effacer la saisie.
// Aucun envoi réel : fetch est simulé (audit 17/10 JFR-UX-001 / JFR-RECETTE-01).
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function el(id, extra = {}) {
  const cls = new Set(extra.hidden ? ['hidden'] : []);
  const attrs = {};
  return Object.assign({ id, value: '', checked: false, textContent: '', disabled: false,
    classList: { add: (...c) => c.forEach((x) => cls.add(x)), remove: (...c) => c.forEach((x) => cls.delete(x)), contains: (c) => cls.has(c) },
    set className(v) { cls.clear(); String(v).split(/\s+/).filter(Boolean).forEach((x) => cls.add(x)); },
    setAttribute(k, v) { attrs[k] = String(v); }, getAttribute: (k) => attrs[k] ?? null, removeAttribute(k) { delete attrs[k]; },
    querySelector: () => null, addEventListener() {}, attrs }, extra);
}

function run(response) {
  const doc = { activeElement: null, documentElement: { lang: 'fr' }, listeners: {} };
  const focusable = (e) => Object.assign(e, { focus() { doc.activeElement = e; } });
  const ids = {
    formMessage: focusable(el('formMessage', { hidden: true })),
    nom: el('nom', { value: 'Recette Test' }), email: el('email', { value: 'recette@example.invalid' }),
    message: el('message', { value: 'Message de recette, simulation.' }), rgpd: el('rgpd', { checked: true }),
  };
  const fields = { source_ref: el('ref', { value: 'jcsm-fr:00000000-0000-4000-8000-000000000000' }), page: el('page'), langue: el('langue') };
  const btn = focusable(el('btn'));
  const parts = { '.submit-text': el('t'), '.submit-loading': el('l', { hidden: true }) };
  btn.querySelector = (s) => parts[s] || null;
  let submit = null, reset = 0;
  const form = el('contactForm', { action: '/api/site-contact.php', reset() { reset++; }, addEventListener(n, fn) { if (n === 'submit') submit = fn; },
    querySelectorAll: () => [], querySelector(s) {
      const m = s.match(/name="(source_ref|page|langue)"/); if (m) return fields[m[1]];
      return s === 'button[type="submit"]' ? btn : null;
    } });
  ids.contactForm = form;
  Object.assign(doc, { getElementById: (i) => ids[i] || null, addEventListener: (n, fn) => { doc.listeners[n] = fn; } });
  const ctx = { document: doc, navigator: { onLine: true }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    window: { location: { pathname: '/contact' }, crypto: { randomUUID: () => '11111111-1111-4111-8111-111111111111' }, JCSM_I18N: { t: (k) => k } },
    FormData: class {}, AbortController: class { constructor() { this.signal = {}; } abort() {} }, console,
    // Délai d envoi (15 s) jamais déclenché ; tout autre minuteur (ex. masquage du message) s exécute aussitôt.
    setTimeout: (fn, ms) => { if (ms !== 15000) fn(); return 0; }, clearTimeout() {},
    fetch: () => (response instanceof Error ? Promise.reject(response)
      : Promise.resolve({ ok: response.status < 300, status: response.status, json: async () => response.body })) };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/landing.js'), 'utf8'), ctx);
  doc.listeners.DOMContentLoaded();
  btn.focus();
  submit({ preventDefault() {} });
  return new Promise((r) => setImmediate(() => setImmediate(() => r({ msg: ids.formMessage, doc, reset, ref: fields.source_ref, btn }))));
}

const CASES = [
  [{ status: 409, body: { ok: false } }, 'formConflict'],
  [{ status: 422, body: { ok: false } }, 'formInvalid'],
  [{ status: 429, body: { ok: false } }, 'formRateLimit'],
  [{ status: 503, body: { ok: false } }, 'formUnavailable'],
  [{ status: 500, body: null }, 'formError'],
  [new TypeError('Failed to fetch'), 'formError'],
  [Object.assign(new Error('abort'), { name: 'AbortError' }), 'formTimeout'],
];
for (const [response, key] of CASES) {
  test(`réponse ${response.status || response.name} : consigne ${key}, saisie conservée`, async () => {
    const r = await run(response);
    assert.equal(r.msg.textContent, key);
    assert.equal(r.msg.classList.contains('hidden'), false);
    assert.equal(r.reset, 0, 'le formulaire ne doit pas être vidé');
    assert.equal(r.btn.disabled, false, 'le visiteur peut renvoyer');
    assert.equal(r.doc.activeElement, r.msg, 'le focus rejoint le message');
    assert.equal(r.msg.getAttribute('role'), 'status');
    assert.equal(r.msg.getAttribute('aria-live'), 'polite');
    if (response.status === 409) assert.equal(r.ref.value, '', 'nouvelle référence au prochain envoi');
    else assert.notEqual(r.ref.value, '', 'même référence pour un renvoi sans doublon');
  });
}

test('201 et 200 « déjà reçue » : succès qui reste affiché', async () => {
  for (const response of [{ status: 201, body: { ok: true, deja_recue: false } }, { status: 200, body: { ok: true, deja_recue: true } }]) {
    const r = await run(response);
    assert.equal(r.msg.textContent, 'formSuccess');
    assert.equal(r.reset, 1);
    assert.equal(r.msg.classList.contains('hidden'), false);
  }
});

test('les consignes existent dans les 8 langues, sans tiret cadratin', () => {
  const ctx = { document: { documentElement: { lang: 'fr' }, readyState: 'loading', addEventListener() {} }, window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8'), ctx);
  const T = ctx.window.JCSM_I18N.T;
  for (const k of ['formConflict', 'formInvalid', 'formRateLimit', 'formUnavailable', 'formError', 'formTimeout', 'formSuccess']) {
    for (const l of ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl', 'pt']) {
      assert.ok(T[k] && T[k][l], `${k}.${l} manquant`);
      assert.ok(!/—/.test(T[k][l]), `${k}.${l} contient un tiret cadratin`);
    }
  }
  const distinct = new Set(['formConflict', 'formInvalid', 'formRateLimit', 'formUnavailable', 'formError'].map((k) => T[k].fr));
  assert.equal(distinct.size, 5);
});
