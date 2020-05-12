/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
if ('function' === typeof importScripts) {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js'
  );

  // Global workbox
  if (workbox) {
    console.log('Workbox is loaded');
  }

  // TODO change to false!
  workbox.setConfig({ debug: false });

  workbox.precaching.precacheAndRoute([], {
    cleanURLs: false
  });

  // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets'
    })
  );

  // Cache the underlying font files with a cache-first strategy for 1 year.
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /^https:\/\/firebasestorage\.googleapis\.com/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 7,
          maxEntries: 100
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => {
      result =
        /\/auth\/details$/.test(request.url) ||
        (request.method === 'GET' && /\/status$/.test(request.url)) ||
        /\/contacts$/.test(request.url);
      // console.log('[Service Worker] matching request', result, request);
      return result;
    },
    new workbox.strategies.NetworkFirst({
      cacheName: 'app-details'
    })
  );

  const clientUrl = 'http://localhost:3000';

  self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;

    // console.log('[Service Worker] notification clicked', notification);
    if (action === 'confirm' || action === '' || action == null) {
      let urlToOpen;
      if (notification.tag === 'contact-request') {
        urlToOpen = `${clientUrl}/pendingContacts`;
      } else if (notification.tag === 'confirm-notification') {
        urlToOpen = `${clientUrl}/settings`;
      } else {
        urlToOpen = clientUrl;
      }
      event.waitUntil(
        clients.matchAll().then((clis) => {
          let client = clis.find(
            (cli) =>
              cli.visibilityState === 'visible' || cli.url.startsWith(clientUrl)
          );
          if (client) {
            if (client.url !== urlToOpen) {
              client.navigate(urlToOpen);
            }
            client.focus();
          } else {
            clients.openWindow(clientUrl);
          }
        })
      );
    }
    notification.close();
  });

  function isClientFocused() {
    return clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        let clientIsFocused = false;

        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url.startsWith(clientUrl) && windowClient.focused) {
            clientIsFocused = true;
            break;
          }
        }

        return clientIsFocused;
      });
  }

  self.addEventListener('push', (event) => {
    event.waitUntil(
      isClientFocused()
        .then((clientIsFocused) => {
          if (clientIsFocused) {
            // console.log("Don't need to show a notification.");
            return;
          }
          // console.log("Client isn't focused, we need to show a notification.");
          // Client isn't focused, we need to show a notification.
          let data = {
            title: 'Something happened!',
            content: 'Open Trust-o-Meter to see updates',
            tag: 'general'
          };
          if (event.data) {
            data = JSON.parse(event.data.text());
          }

          const options = {
            body: data.content,
            icon: `/icons/icon96.png`,
            badge: `/icons/iconBadge.png`,
            tag: data.tag,
            renotify: false
          };
          return self.registration.showNotification(data.title, options);
        })
        .catch((error) => {
          console.log('error', error);
        })
    );
  });
}
