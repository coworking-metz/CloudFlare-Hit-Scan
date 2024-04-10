self.addEventListener('fetch', event => {
    event.respondWith(
      (async function() {
        const response = await fetch(event.request);
        const cacheStatus = response.headers.get('CF-Cache-Status');
        console.log(`Cache status for ${event.request.url}: ${cacheStatus}`);
        return response;
      })()
    );
  });