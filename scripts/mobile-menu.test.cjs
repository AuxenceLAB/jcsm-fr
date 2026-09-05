const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/public.js', 'utf8');
const menuSource = source.slice(source.indexOf('function setMobileMenuOpen('), source.indexOf('function initScrollAnimations('));
const keyboardSource = source.slice(source.indexOf('function initKeyboardNavigation('), source.indexOf('function initTouchFeedback('));
const accessibilitySource = source.slice(source.indexOf('function initAccessibilityEnhancements('), source.indexOf('function initToastNotifications('));

function fixture() {
  let document;
  function element(id, tagName = 'BUTTON') {
    const classes = new Set();
    const attributes = new Map();
    const listeners = new Map();
    return {
      id, tagName, inert: false, tabIndex: 0, visible: true, style: {},
      classList: {
        contains: name => classes.has(name),
        toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
      },
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: name => attributes.get(name),
      addEventListener: (name, listener) => listeners.set(name, listener),
      getClientRects() { return this.visible ? [{}] : []; },
      focus() { document.activeElement = this; },
      fire(name, properties = {}) {
        const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...properties };
        listeners.get(name)?.(event);
        return event;
      },
    };
  }
  const toggle = element('mobile-menu-btn');
  const menu = element('mobile-menu', 'NAV');
  const close = element('mobile-menu-close');
  const link = element('last-menu-link', 'A');
  const hiddenLink = element('hidden-menu-link', 'A');
  hiddenLink.visible = false;
  const overlay = element('mobile-menu-overlay', 'DIV');
  const main = element('main', 'MAIN');
  const footer = element('footer', 'FOOTER');
  const nodes = new Map([toggle, menu, close, overlay, main, footer].map(node => [node.id, node]));
  menu.querySelector = () => close;
  menu.querySelectorAll = () => [close, link, hiddenLink];
  const events = new Map();
  document = {
    activeElement: main,
    body: { style: { overflow: '' }, appendChild() {} },
    createElement: tag => element('', tag),
    getElementById: id => nodes.get(id) || null,
    querySelector: selector => nodes.get(selector) || null,
    querySelectorAll: selector => selector === '[role="dialog"], .modal' ? [menu] : [],
    addEventListener: (name, listener) => events.set(name, listener),
  };
  let resize;
  const window = { matchMedia: query => {
    assert.equal(query, '(min-width: 1280px)');
    return { addEventListener: (name, listener) => { assert.equal(name, 'change'); resize = listener; } };
  } };
  assert(menuSource.includes('function initMobileMenu('));
  assert(keyboardSource.includes('setMobileMenuOpen(false)'));
  vm.runInNewContext(menuSource + keyboardSource + accessibilitySource + '\ninitMobileMenu(); initAccessibilityEnhancements(); initKeyboardNavigation();', { document, window });
  return { document, toggle, menu, close, link, overlay, main, footer, events, resize: () => resize({ matches: true }) };
}

function assertClosed(f) {
  assert.equal(f.menu.inert, true);
  assert.equal(f.menu.classList.contains('open'), false);
  assert.equal(f.menu.getAttribute('aria-hidden'), 'true');
  assert.equal(f.toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(f.main.inert, false);
  assert.equal(f.footer.inert, false);
  assert.equal(f.document.body.style.overflow, '');
}

test('le menu ferme est inerte sans voler le focus initial', () => {
  const f = fixture();
  assertClosed(f);
  assert.equal(f.document.activeElement, f.main);
});

test('ouvrir le menu active le dialogue et place le focus sur son premier bouton', () => {
  const f = fixture();
  f.toggle.fire('click');
  assert.equal(f.menu.inert, false);
  assert.equal(f.menu.getAttribute('aria-hidden'), 'false');
  assert.equal(f.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(f.main.inert, true);
  assert.equal(f.footer.inert, true);
  assert.equal(f.document.activeElement, f.close);
});

for (const control of ['close', 'overlay', 'toggle']) {
  test(`fermer via ${control} restaure le focus et rend le fond accessible`, () => {
    const f = fixture();
    f.toggle.fire('click');
    f[control].fire('click');
    assertClosed(f);
    assert.equal(f.document.activeElement, f.toggle);
  });
}

test('Echap ferme le dialogue et restaure le focus au bouton du menu', () => {
  const f = fixture();
  f.toggle.fire('click');
  let prevented = false;
  f.events.get('keydown')({ key: 'Escape', preventDefault() { prevented = true; } });
  assertClosed(f);
  assert.equal(prevented, true);
  assert.equal(f.document.activeElement, f.toggle);
});

test('Tab et Maj Tab bouclent uniquement sur les controles visibles du menu', () => {
  const f = fixture();
  f.toggle.fire('click');
  assert.equal(f.menu.fire('keydown', { key: 'Tab', shiftKey: true }).defaultPrevented, true);
  assert.equal(f.document.activeElement, f.link);
  assert.equal(f.menu.fire('keydown', { key: 'Tab', shiftKey: false }).defaultPrevented, true);
  assert.equal(f.document.activeElement, f.close);
});

test('Echap puis reouverture ne subit pas le handler generique des dialogues', () => {
  const f = fixture();
  f.toggle.fire('click');
  f.menu.fire('keydown', { key: 'Escape' });
  f.events.get('keydown')({ key: 'Escape', preventDefault() {} });
  assertClosed(f);
  assert.notEqual(f.menu.style.display, 'none');
  f.toggle.fire('click');
  assert.equal(f.menu.inert, false);
  assert.equal(f.menu.classList.contains('open'), true);
  assert.equal(f.document.activeElement, f.close);
});

test('passer sur ordinateur ferme le menu sans focaliser un bouton masque', () => {
  const f = fixture();
  f.toggle.fire('click');
  f.toggle.visible = false;
  f.resize();
  assertClosed(f);
  assert.notEqual(f.document.activeElement, f.toggle);
});

test('le CSS rend les menus fermes invisibles meme avant le JavaScript', () => {
  const css = fs.readFileSync('styles.css', 'utf8');
  assert.match(css, /\.mobile-menu\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(css, /\.mobile-menu\.open\s*\{[^}]*visibility:\s*visible/s);
});
