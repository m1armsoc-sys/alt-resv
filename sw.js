/* Service worker: faster repeat visits. Pages/code are network-first (updates show right away); pictures are cache-first and refresh in the background. */
var V='aarf-v1';
self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin) return;   // the Google Sheet calls are never cached
  var save=function(res){ if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})} return res };
  if(/\.(png|jpe?g|webp|svg|gif|ico)$/i.test(u.pathname)){
    e.respondWith(caches.match(r).then(function(hit){var net=fetch(r).then(save).catch(function(){return hit});return hit||net}));
  } else {
    e.respondWith(fetch(r).then(save).catch(function(){return caches.match(r).then(function(h){return h||caches.match('index.html')})}));
  }
});
