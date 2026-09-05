const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function fixture(consent,age=0) {
  const store=new Map([['jcsm_cookie_consent',consent],['jcsm_cookie_consent_ts',String(Date.now()-age)]]);
  const events={},timers=[],sent=[];
  const context={localStorage:{getItem:k=>store.get(k)},sessionStorage:{getItem:()=>null,setItem(){}},
    window:{addEventListener:(name,fn)=>{events[name]=fn;}},document:{referrer:'https://example.test/page?secret=hidden',addEventListener(){},body:{scrollHeight:1000}},
    location:{origin:'https://jcsm.fr',pathname:'/contact',search:'?secret=hidden'},screen:{width:390,height:800},
    navigator:{userAgent:'recipe',sendBeacon:(url,blob)=>sent.push(JSON.parse(blob.parts.join('')))},
    crypto:require('node:crypto').webcrypto,Blob:class{constructor(parts){this.parts=parts;}},URL,Date,
    setInterval:fn=>{timers.push(fn);return timers.length;},clearInterval(){},requestAnimationFrame:fn=>fn()};
  vm.runInNewContext(fs.readFileSync('js/analytics.js','utf8'),context);
  return {store,events,timers,sent};
}
for (const choice of [null,'rejected','invalid']) test(`aucune mesure avant consentement: ${choice}`,()=>{
  const f=fixture(choice);assert.equal(f.timers.length,0);assert.equal(f.sent.length,0);
});
test('un consentement expire ne lance pas la collecte',()=>{
  assert.equal(fixture('accepted',366*24*60*60*1000).timers.length,0);
});
test('acceptation et evenement demarrent une seule collecte, sans parametres URL',()=>{
  const f=fixture(null);f.store.set('jcsm_cookie_consent','accepted');
  f.events['jcsm:consent-change']();f.events['jcsm:consent-change']();assert.equal(f.timers.length,1);
  f.timers[0]();assert.equal(f.sent.length,1);assert.equal(f.sent[0][0].url,'/contact');
  assert.equal(f.sent[0][0].referrer,'https://example.test/page');assert(!JSON.stringify(f.sent).includes('hidden'));
});
test('retirer le consentement empeche les envois restants',()=>{
  const f=fixture('accepted');f.store.set('jcsm_cookie_consent','rejected');f.timers[0]();assert.equal(f.sent.length,0);
});
