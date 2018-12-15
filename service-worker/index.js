// Warning: This code is not being transpiled and served 1:1.
console.log("Hello from the Service Worker");

self.addEventListener('push', ev => {
  const { _id, title, ...data } = ev.data.json();
  console.log("Push(" + _id + "):", title, data);
  self.registration.showNotification(title, {
    tag: _id,
    icon: '/static/content/system/logo.png',
    ...data
  });
});

/*
const transformCacheEntry = ({ url }) => url;

self.addEventListener("install", event => {
  caches.open("helios-v1").then(cache => {
    return cache.addAll(["/", ...self.__precacheManifest.map(transformCacheEntry)]);
  });
});
*/
/*
self.addEventListener("fetch", async event => {
  console.log("Worker got fetch! " + event.request.url);
  const cachedResponse = await caches.match(event.request);
  // Return it if we found one.
  if (cachedResponse) {
    console.log("HAS cache for " + event.request.url);
    return cachedResponse;
  }
  console.log("NO cache for " + event.request.url);
  // If we didn't find a match in the cache, use the network.
  return fetch(event.request);
});
*/