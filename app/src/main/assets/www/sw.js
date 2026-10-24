const C='studysprint-v1';
const F=['./','index.html','css/style.css','js/app.js','data/sample-questions.js','manifest.json','icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{
  if(new URL(e.request.url).origin!==location.origin)return; // never cache PhET / remote
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
