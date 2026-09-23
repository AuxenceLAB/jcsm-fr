// Concatène les feuilles publiques dans l'ordre exact de la cascade, puis les minifie (lightningcss) :
//   css/site-a.css       = critical + tailwind + styles            (avant les <style> propres à la page)
//   css/site-a-theme.css = site-a + theme-2026                    (pages qui chargeaient theme-2026.css)
//   css/site-b.css       = public-layout + editorial-20260906      (toujours en dernier)
// Deux feuilles et non une : plusieurs pages placent un <style> entre les deux groupes.
// Les cibles gardent une syntaxe lisible par Safari 14 (pas de requêtes média en intervalles, pas d'inset).
const fs = require('node:fs'), path = require('node:path');
const { transform } = require('lightningcss');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const v = major => major << 16;
const targets = { safari: v(14), ios_saf: v(14), chrome: v(90), edge: v(90), firefox: v(88) };
const bundles = {
  'css/site-a.css': ['css/critical.css', 'css/tailwind.css', 'styles.css'],
  'css/site-a-theme.css': ['css/critical.css', 'css/tailwind.css', 'styles.css', 'css/theme-2026.css'],
  'css/site-b.css': ['css/public-layout.css', 'css/editorial-20260906.css'],
};
function build(parts) {
  const code = parts.map(f => read(f).trim()).join('\n');
  return '/* Généré par scripts/build-css-bundle.cjs depuis ' + parts.join(' + ') + ' : ne pas éditer. */\n'
    + transform({ filename: parts.join('+'), code: Buffer.from(code), minify: true, targets }).code.toString() + '\n';
}
module.exports = { bundles, build };
if (require.main === module) {
  for (const [out, parts] of Object.entries(bundles)) fs.writeFileSync(path.join(root, out), build(parts));
  console.log(JSON.stringify(Object.keys(bundles)));
}
