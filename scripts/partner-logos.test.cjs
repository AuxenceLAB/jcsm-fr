const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
test('les logos partenaires utilisent des originaux cadres sans deformation',()=>{
  assert(fs.readFileSync('styles.css','utf8').includes('width:var(--logo-width,100%)'));
  let count=0;
  for(const file of cp.execFileSync('git',['ls-files','*.html'],{encoding:'utf8'}).trim().split('\n')){
    const html=fs.readFileSync(file,'utf8');
    const items=[...html.matchAll(/<div\b(?=[^>]*class="(?:[^"]* )?logo-item(?: |"))[^>]*>([\s\S]*?)<\/div>/g)];
    if(items.length) assert(/(?:styles|site-a(?:-theme)?)\.css\?v=/.test(html),file);
    for(const [,body] of items){
      assert(body.includes('--logo-width:'),file);
      assert(body.includes('--logo-height:'),file);
      assert(!body.includes('<source'),file);
      // Seules les vignettes datées (originaux réduits, ratio conservé) sont admises en webp.
      assert(!/src="[^"]*\.webp/.test(body.replace(/-thumb-\d{8}\.webp/g,'')),file);
      assert(!body.includes('perpignan.png'),file);
      count++;
    }
  }
  assert(count>=69);
});
