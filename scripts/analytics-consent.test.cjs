const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function fixture(consent,age=0,blockedSession=false) {
  const store=new Map([['jcsm_cookie_consent',consent],['jcsm_cookie_consent_ts',String(Date.now()-age)]]);
  const events={},timers=[],sent=[];
  const context={localStorage:{getItem:k=>store.get(k)},sessionStorage:{getItem:()=>{if(blockedSession)throw Error('Storage blocked');return null;},setItem(){}},
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
test('une date future ne permet pas la collecte',()=>{
  assert.equal(fixture('accepted',-60000).timers.length,0);
});
test('un stockage de session bloque ne casse pas la page',()=>{
  const f=fixture('accepted',0,true);f.timers[0]();assert.equal(f.sent.length,1);
});

function cookieFixture(choice,timestamp){
  const store=new Map([['jcsm_cookie_consent',choice],['jcsm_cookie_consent_ts',timestamp]]);
  const events={},scripts=[];
  const context={localStorage:{getItem:k=>store.get(k),removeItem:k=>store.delete(k)},Date,Number,
    window:{},document:{readyState:'loading',addEventListener:(name,fn)=>{events[name]=fn;},
      getElementById:()=>null,createElement:()=>({}),head:{appendChild:el=>scripts.push(el)}}};
  vm.runInNewContext(fs.readFileSync('js/cookie-consent.js','utf8'),context);
  return {store,events,scripts};
}
for(const [label,timestamp] of [['absente',null],['invalide','NaN'],['future',String(Date.now()+60000)],['expiree',String(Date.now()-366*24*60*60*1000)]]){
  test(`GTM ne charge pas une acceptation avec date ${label}`,()=>{
    const f=cookieFixture('accepted',timestamp);assert.equal(f.scripts.length,0);
    assert.equal(typeof f.events.DOMContentLoaded,'function');assert.equal(f.store.has('jcsm_cookie_consent'),false);
  });
}
test('GTM respecte une decision valide et refuse les choix inconnus',()=>{
  const now=String(Date.now());assert.equal(cookieFixture('accepted',now).scripts.length,1);
  assert.equal(cookieFixture('rejected',now).scripts.length,0);
  const invalid=cookieFixture('unknown',now);assert.equal(invalid.scripts.length,0);assert.equal(typeof invalid.events.DOMContentLoaded,'function');
});
