const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
test('les logos partenaires utilisent des originaux cadres sans deformation',()=>{
  let count=0;
  for(const file of cp.execFileSync('git',['ls-files','*.html'],{encoding:'utf8'}).trim().split('\n')){
    const html=fs.readFileSync(file,'utf8');
    const items=[...html.matchAll(/<div\b(?=[^>]*class="(?:[^"]* )?logo-item(?: |"))[^>]*>([\s\S]*?)<\/div>/g)];
    for(const [,body] of items){
      assert(body.includes('--logo-width:'),file);
      assert(body.includes('--logo-height:'),file);
      assert(!body.includes('<source'),file);
      assert(!/src="[^"]*\.webp/.test(body),file);
      assert(!body.includes('perpignan.png'),file);
      count++;
    }
  }
  assert(count>=69);
});
