// Reviewed photograph families. Different crops, formats and filenames can show
// the same scene; byte hashes alone cannot detect those visual duplicates.
const families = {
  station: ['index.jpg','index.webp','index-800.webp','index-mobile.jpg','index-mobile.webp'],
  vehicle: ['jcsmtesla.jpg','jcsmtesla.webp','jcsmtesla-mobile.webp'],
  electricalInspection: ['remiseconfo.jpg','remiseconfo.webp','remiseconfo-mobile.webp','remiseconformite.jpg','remiseconformite.webp','remiseconformite-mobile.webp'],
  planning: ['amo.jpg','amo.webp','amo-mobile.webp'],
  maintenance: ['maintenance.jpeg','maintenance.webp'],
  chargingPark: ['installation.jpeg','installation.webp'],
  wallChargers: ['2x22kW.jpeg','2x22kW.webp'],
  dcCharger: ['1x60.jpeg','1x60.webp'],
  supervision: ['hotline.jpg','hotline.webp'],
  support: ['supporttech.jpg','supporttech.webp'],
  streetCamera: ['camera.png','camera.webp'],
  solarCamera: ['camera.jpg'],
  damagedCharger: ['vandalisme1.jpeg','vandalisme1.webp'],
  cutChargingCable: ['cablecoupe.jpg','cablecoupe.webp'],
  chargingConnector: ['cable.jpg','cable.webp'],
  cutCable: ['coupe.png','coupe.webp'],
  alarm: ['alarme.jpg','alarme.webp'],
  cableProtection: ['protection.jpg','protection.webp'],
};
const identities = new Map(Object.entries(families).flatMap(([id,files])=>files.map(file=>['/images/'+file,id])));
function photoIdentity(source, file='index.html') {
  const url=new URL(source,new URL(file,'https://jcsm.fr/'));
  return url.origin==='https://jcsm.fr' ? identities.get(url.pathname) : undefined;
}
module.exports={families,photoIdentity};
