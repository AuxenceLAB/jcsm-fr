// Concatène les feuilles publiques dans l'ordre exact de la cascade (sources inchangées) :
//   css/site-a.css       = critical + tailwind + styles            (avant les <style> propres à la page)
//   css/site-a-theme.css = site-a + theme-2026                    (pages qui chargeaient theme-2026.css)
//   css/site-b.css       = public-layout + editorial-20260906      (toujours en dernier)
// Deux feuilles et non une : plusieurs pages placent un <style> entre les deux groupes.
const fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const bundles = {
  'css/site-a.css': ['css/critical.css', 'css/tailwind.css', 'styles.css'],
  'css/site-a-theme.css': ['css/critical.css', 'css/tailwind.css', 'styles.css', 'css/theme-2026.css'],
  'css/site-b.css': ['css/public-layout.css', 'css/editorial-20260906.css'],
};
for (const [out, parts] of Object.entries(bundles)) {
  const body = parts.map(f => '/* ' + f + ' */\n' + read(f).trim()).join('\n');
  fs.writeFileSync(path.join(root, out), '/* Généré par scripts/build-css-bundle.cjs : ne pas éditer. */\n' + body + '\n');
}
console.log(JSON.stringify(Object.keys(bundles)));
