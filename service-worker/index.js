// Warning: This code is not being transpiled and served 1:1.
// We can use ES6 regardless since (almost) all browsers that support service workers also support ES6.
console.log("Hello from the Service Worker");

self.addEventListener('push', ev => {
  const data = ev.data.json();
  const { _id, title, ...args } = data;
  console.log("Push(" + _id + "):", title, args);
  self.registration.showNotification(title, {
    tag: _id,
    icon: '/static/content/system/logo.png',
    ...args,
    data: data
  });
});

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  const { url } = event.notification.data;
  if (url) {
    event.waitUntil(clients.matchAll({ type: "window" }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url == url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }));
  }
});

// Dummy fetch handler to allow us to pose as a proper offline-enabled PWA for now.
self.addEventListener("fetch", async event => {
  //return fetch(event.request);
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