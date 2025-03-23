// public/sw.js
self.addEventListener('fetch', event => {
    // Intercept only requests with a specific path pattern
    if (event.request.url.includes('/secure-stream')) {
      // Redirect to the actual stream URL without exposing it in page source
      event.respondWith(fetch('https://cdn.crichdplays.ru/embed2.php?id=starsp'));
    }
  });