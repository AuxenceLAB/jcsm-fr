// sitemap.xml : <lastmod> = date du dernier commit de la page, et aucune URL en noindex.
// Usage : node scripts/sitemap-lastmod.cjs [--write]   (sans --write : contrôle, code 1 si écart)
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.join(__dirname, '..');
const file = path.join(root, 'sitemap.xml');
const before = fs.readFileSync(file, 'utf8');

function pageFor(loc) {
  const p = new URL(loc).pathname.replace(/^\//, '');
  const candidates = p === '' || p.endsWith('/') ? [p + 'index.html'] : [p + '.html', p + '/index.html', p];
  return candidates.find(c => fs.existsSync(path.join(root, c)));
}
// Date du dernier commit qui change le CONTENU de la page : le <main>, le <title> ou la description.
// Un commit qui ne touche que l'en-tête, le pied de page ou les ?v= (cache-bust de tout le site)
// ne compte pas, sinon les 145 lastmod portent la même date.
const git = (args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 });
function touchesContent(hash, rel, diff) {
  const lines = git(['show', hash + ':' + rel]).split('\n');
  const start = lines.findIndex(l => /<main\b/.test(l));
  const end = lines.findIndex((l, i) => i > start && /<\/main>/.test(l));
  const content = (n) => (start >= 0 && n >= start && n <= end) || /<title>|name="description"/.test(lines[n] || '');
  const strip = l => l.slice(1).replace(/\?v=[\w.-]+/g, '');
  for (const hunk of diff.split(/^(?=@@ )/m).slice(1)) {
    const m = hunk.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (!m) continue;
    const body = hunk.split('\n').slice(1);
    const del = body.filter(l => l.startsWith('-')).map(strip).sort().join('\n');
    const add = body.filter(l => l.startsWith('+')).map(strip).sort().join('\n');
    if (del === add) continue; // seul le ?v= a changé dans ce bloc
    const first = +m[1] - 1, count = m[2] === undefined ? 1 : +m[2];
    if (count === 0 ? content(first) : Array.from({ length: count }, (_, i) => first + i).some(content)) return true;
  }
  return false;
}
function gitDate(rel) {
  const commits = git(['log', '-p', '-U0', '--format=%x00%H %cs', '--', rel]).split('\0').slice(1);
  for (const c of commits) {
    const [hash, date] = c.slice(0, c.indexOf('\n')).split(' ');
    if (touchesContent(hash, rel, c)) return date;
  }
  return commits.length ? commits[commits.length - 1].slice(41, 51) : '';
}

let changed = 0, removed = [];
const after = before.replace(/(\n[ \t]*<!--[^\n]*-->)?\n[ \t]*<url>[\s\S]*?<\/url>/g, (block) => {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)[1];
  const page = pageFor(loc);
  if (!page) return block;
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) { removed.push(loc); return ''; }
  const date = gitDate(page);
  if (!date) return block;
  return block.replace(/<lastmod>[^<]*<\/lastmod>/, (tag) => {
    const next = '<lastmod>' + date + '</lastmod>';
    if (next !== tag) changed++;
    return next;
  });
});

const result = { urls: (after.match(/<url>/g) || []).length, changed, removed };
if (process.argv.includes('--write')) { if (after !== before) fs.writeFileSync(file, after); }
else if (after !== before) { console.log(JSON.stringify(result)); process.exit(1); }
console.log(JSON.stringify(result));
