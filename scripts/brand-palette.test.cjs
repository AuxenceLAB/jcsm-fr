const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');

test('les deux palettes communes et les anciens alias sont bleus', () => {
  for (const file of ['styles.css', 'css/critical.css', 'css/theme-2026.css']) {
    const text = fs.readFileSync(file, 'utf8');
    assert.match(text, /--color-primary:\s*#205BC4/i, file);
    assert(!/#(?:c2703b|a85e30|8f4e27|e0a878)\b|194,\s*112,\s*59/i.test(text), file);
  }
  assert.match(fs.readFileSync('css/critical.css', 'utf8'), /--blue:\s*#205BC4/i);
});
test('les accents publics et le bandeau ne reintroduisent pas le cuivre', () => {
  for (const file of ['index.html','devenir-partenaire.html','exploitation.html','securisation-installations.html','js/cookie-consent.js']) {
    assert(!/#(?:c2703b|a85e30|8f4e27|e0a878)\b|194,\s*112,\s*59/i.test(fs.readFileSync(file,'utf8')),file);
  }
});
test('chaque page publique partage les styles et la version du cache', () => {
  const version = fs.readFileSync('sw.js','utf8').match(/jcsm-static-v(\d+)/)[1];
  let count = 0;
  for (const file of cp.execFileSync('git',['ls-files','*.html'],{encoding:'utf8'}).trim().split('\n')) {
    if (/^(demo\/|_|powerdot\.html|virta\.html|evergreen\.html|interne|ca\d?\.html|rapport-intervention)/.test(file)) continue;
    const text=fs.readFileSync(file,'utf8');
    for (const [,found] of text.matchAll(/\?v=(\d+)/g)) assert.equal(found,version,file);
    if (text.includes('css/critical.css')) count++;
  }
  assert(count>=130);
});
test('le commentaire carte et le clavier cookies ne cassent pas le rendu', () => {
  const theme=fs.readFileSync('css/theme-2026.css','utf8');
  assert(!theme.includes('otherwise collapses markers'));
  const consent=fs.readFileSync('js/cookie-consent.js','utf8');
  assert(!consent.includes('setTimeout(focusFirst'));
  assert(!consent.includes('[rejectBtn, acceptBtn, link]'));
});
