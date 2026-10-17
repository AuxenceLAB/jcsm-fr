// Garde-fou : un seul délai promis (« sous 48 h », avec « selon contrat » quand il s'agit d'un
// engagement de service) et une seule disponibilité (24/7, ce que les CGV art. 6 permettent de tenir).
// Décision d'Auxence du 04/10/2026. Les six autres langues (de, es, it, nl, pl, pt) sont alignées sur
// 48 h depuis l'audit du 17/10 (JFR-002) : le dernier test ci-dessous interdit d'y réintroduire 24 h.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const files = cp.execFileSync('git', ['ls-files', '*.html', 'llms.txt', 'llms-full.txt'], { cwd: root, encoding: 'utf8' })
  .trim().split('\n')
  .filter(f => !/^(de|es|it|nl|pl|pt|propositions-legales|node_modules|docs)\//.test(f))
  .filter(f => !/^(_|evergreen\.html$)/.test(f));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const plain = s => s.replace(/\u00a0/g, " ").replace(/<[^>]*>/g, ' ').replace(/&eacute;/g, 'é').replace(/&#233;/g, 'é').replace(/\s+/g, ' ');

// Tableaux de marché (niveaux de SLA génériques), pas des promesses de JCSM.
const MARKET = [/4 heures, 7j\/7/, /24 heures ouvrées <\/td>|>\s*24 heures ouvrées\s*</];

test('aucune ancienne promesse de délai ou de disponibilité', () => {
  const banned = [
    /24\s?h(?:eures)?\s+ouvr(?:ées|&eacute;es|&#233;es)/i,
    /24 (?:business|working) hours/i,
    /(?:sous|within) 24\s?h(?:ours)?\b(?!\s*(?:sur|\/))(?=[^<]{0,60}(?:répon|reponse|réponse|devis|rappel|quote|reply|respon|back to you|intervention))/i,
    /7j\/7|7 days a week/i,
  ];
  const hits = [];
  for (const f of files) {
    const t = read(f).replace(/\u00a0/g, ' ');
    for (const re of banned) {
      const m = re.exec(MARKET.reduce((s, x) => s.replace(x, ''), t));
      if (m) hits.push(`${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(hits, []);
});

test('les engagements de service portent « selon contrat » (FR) ou « as per contract » (EN)', () => {
  const fr = /(technicien sur site|intervention (?:curative|terrain|sur site)|notre engagement[^.]{0,40}|SLA (?:standard|contractuel)[^.]{0,30}|borne de courtoisie|GTR)[^.<]{0,60}sous 48 h(?!, selon contrat| selon contrat)/i;
  const en = /(SLA provides|technician on site|Contractual SLA|Emergency interventions|Loan charger replacement)[^.<]{0,60}within 48 hours(?!,? as per contract)/i;
  const hits = [];
  for (const f of files) {
    const t = plain(read(f));
    const m = (f.startsWith('en/') ? en : fr).exec(t);
    if (m) hits.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(hits, []);
});

test('CGV, FAQ et vitrine disent la même chose', () => {
  const cgv = plain(read('cgv.html'));
  assert.match(cgv, /Support client : disponibilité 24\/7/);
  assert.match(cgv, /Interventions d'urgence : réponse sous 48 h selon contrat/);
  assert.match(plain(read('faq.html')), /réponse sous 48 h, selon contrat/);
  assert.match(plain(read('index.html')), /Réponse sous 48 h selon contrat/);
  assert.match(plain(read('en/terms.html')), /response within 48 hours as per contract/);
});

test('une seule disponibilité annoncée : 24/7', () => {
  assert.match(plain(read('index.html')), /Hotline IRVE 100% basée en France, 24\/7/);
  assert.match(plain(read('en/index.html')), /hotline based 100% in France, 24\/7/);
});

// de, es, it, nl, pl, pt : plus aucune promesse « 24 h » (avec ou sans « jours ouvrés »). Sont ignorés :
// les coordonnées de tracés SVG (« 1.771 24h20.451 »), les valeurs CSS (« 24px ») et le 24/7 (« 24h/24 »,
// « 24 ore su 24 », « 24 horas al día » n'existent pas dans ces pages ; seul « 24/7 » y figure).
test('de, es, it, nl, pl, pt : aucune promesse de délai de 24 h', () => {
  const langs = cp.execFileSync('git', ['ls-files', 'de/*.html', 'es/*.html', 'it/*.html', 'nl/*.html', 'pl/*.html', 'pt/*.html'], { cwd: root, encoding: 'utf8' })
    .trim().split('\n');
  assert.ok(langs.length >= 40, 'les six dossiers de langue doivent être scannés');
  const unit = '(?:h|Std\\.?|Stunden|Arbeitsstunden|Geschäftsstunden|horas|ore|uur|u|werkuur|werkuren|godz\\w*)';
  const re = new RegExp('(?<![\\d.%-])(?<![\\d.] )24(?:\\s|&nbsp;)?' + unit + '(?![\\w/])(?!\\s+(?:su|sobre|op|por|na|am)\\s+24)', 'g');
  const hits = [];
  for (const f of langs) {
    for (const m of read(f).replace(/\u00a0/g, ' ').matchAll(re)) hits.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(hits, []);
});
