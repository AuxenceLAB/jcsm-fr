const {test}=require('node:test');
const assert=require('node:assert/strict');
const data=require('../js/coverage-points.json');
test('reperes uniques, geographiques et sans donnees privees',()=>{
  assert.equal(data.points.length,104);
  assert.equal(new Set(data.points.map(p=>p.code)).size,104);
  for(const p of data.points){assert.deepEqual(Object.keys(p).sort(),['code','lat','lng','name']);assert(p.lat>40&&p.lat<53&&p.lng>-6&&p.lng<11);}
});
test('villes auparavant mal placees et Corse presentes',()=>{
  const city=name=>data.points.find(p=>p.name===name);
  assert(city('Orléans').lat>47.8);
  assert(city('La Rochelle').lng<-1);
  assert(city('Dax').lat<43.8);
  assert(city('Cahors').lat>44.4);
  assert(city('Ajaccio'));assert(city('Bastia'));assert(city('Bruxelles'));
  assert.equal(data.points.filter(p=>p.name==='Perpignan').length,1);
});
