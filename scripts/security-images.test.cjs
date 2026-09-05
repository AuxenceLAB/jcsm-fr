const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const pages = [
  'securisation-installations.html', 'en/installation-security.html',
  'de/anlagensicherung.html', 'es/seguridad-instalaciones.html',
  'it/sicurezza-installazioni.html', 'nl/beveiliging-installaties.html',
  'pl/zabezpieczenie-instalacji.html', 'pt/seguranca-instalacoes.html',
];

for (const page of pages) {
  test(`${page}: neuf photos distinctes, y compris dans un navigateur WebP`, () => {
    const html = fs.readFileSync(page, 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    const pictures = [...main.matchAll(/<picture\b[^>]*>([\s\S]*?)<\/picture>/g)].map(m => m[1]);
    assert.equal(pictures.length, 9);
    for (const webp of [false, true]) {
      const hashes = pictures.map(picture => {
        const src = (webp && picture.match(/<source\b[^>]*srcset="([^"]+)"/))
          || picture.match(/<img\b[^>]*src="([^"]+)"/);
        const file = path.resolve(path.dirname(page), src[1]);
        assert(fs.existsSync(file), file);
        return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      });
      assert.equal(new Set(hashes).size, 9, `photos répétées, WebP=${webp}`);
    }
    // camera.jpg (solar mast) and camera.png (streetlight) are different photos.
    // A basename-only conversion incorrectly gave both the same WebP source.
    const solar = pictures.find(picture => /src="(?:\.\.\/)?images\/camera\.jpg"/.test(picture));
    assert(solar);
    assert(!solar.includes('camera.webp'));
  });
}
