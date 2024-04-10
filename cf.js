console.log('cf.js');

(() => {
    console.log('cf.js - start');
    let prec, current;
    onUrlChange(() => {
        current = window.location.href;
        if (prec == current) return;
        prec = current;

        console.log('cf.js - scan');
        fetch(current, { cache: "force-cache" }).then(async (response) => {
            // Accessing specific header
            console.log(response.headers.get('Content-Type'));

            const cfCacheStatus = response.headers.get('cf-cache-status');
            const statuses = ['HIT', 'MISS', 'EXPIRED'];

            // console.log({ cfCacheStatus })
            if (statuses.includes(cfCacheStatus)) {
                console.log('cf.js - hit');
                const urls = await findStaticAssetsUrls();
                console.log({ urls });
                urls.push(current);
                fetch('https://cloudflare.coworking-metz.fr/hit', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ urls })
                });

                // fetch('https://cloudflare.coworking-metz.fr/hit?url=' + current , {cache: "no-store"})
            } else {
                console.log('cf.js - nothing to do');
            }
        }).catch(error => {
            console.error('cf.js - Error fetching headers:', error);
        });
    })


    // Fonction pour détecter les changements d'URL
    function onUrlChange(callback) {
        // lancement au chargement de la page
        domReady(callback)

        // Écoute des événements 'popstate' pour les changements d'URL dûs à l'historique de navigation
        window.addEventListener('popstate', callback);


        // Surcharge de la fonction 'pushState' pour détecter les changements d'URL initiés par l'application
        const originalPushState = history.pushState;
        history.pushState = function () {
            originalPushState.apply(this, arguments);
            callback();
        };

        // Surcharge de la fonction 'replaceState' pour détecter les remplacements d'URL
        const originalReplaceState = history.replaceState;
        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            callback();
        };
    }
    async function findStaticAssetsUrls() {
        const urls = [];

        // Helper function to transform a URL to absolute and add it to the set, excluding data URLs
        function addUrl(url) {
            if (!isCached(url)) return;
            if (!isValidUrl(url)) return;
            const absoluteUrl = new URL(url, window.location.origin).href;
            urls.push(absoluteUrl);
        }

        // Helper function to extract URLs from CSS style strings and transform them to absolute URLs
        function extractUrlsFromStyle(styleString) {
            const urlRegex = /url\(["']?(.*?)["']?\)/g;
            let match;
            while ((match = urlRegex.exec(styleString)) !== null) {
                if (match[1]) addUrl(match[1]);
            }
        }

        // Helper function to determine if a URL is not a data URL
        function isValidUrl(url) {
            if (!isLocal(url)) return;
            return url.startsWith('http') || url.startsWith('/') || url.startsWith('://');
        }

        // Helper function to determine if a URL may be cached
        function isCached(url) {
            if (url.includes('php')) return false;
            if (url.includes('api-json-wp')) return false;
            if (url.includes('wp-json')) return false;
            if (url.includes('wpapi')) return false;
            return true;
        }

        // Helper function to determine if a URL's top domain matches the current top domain
        function isLocal(url) {
            try {
                const getTopDomain = (hostname) => {
                    // Split hostname into parts and return the top domain
                    const parts = hostname.split('.');
                    return parts.slice(-2).join('.'); // Assumes second-level domain names (e.g., example.com)
                };

                const urlHostname = new URL(url, window.location.origin).hostname;
                const currentHostname = window.location.hostname;

                // Compare top domains
                return getTopDomain(urlHostname) === getTopDomain(currentHostname);
            } catch (error) {
                console.error("Error checking URL:", url, error);
                return false;
            }
        }

        // Helper function to fetch and process local CSS files
        async function processLocalCSS(url) {
            if (isValidUrl(url)) {
                const absoluteUrl = new URL(url, window.location.origin).href;
                try {
                    const response = await fetch(absoluteUrl);
                    const text = await response.text();
                    extractUrlsFromStyle(text);
                } catch (error) {
                    console.error("Error fetching CSS file:", absoluteUrl, error);
                }
            }
        }

        // Collect URLs from various tag attributes and inline styles
        const elements = document.querySelectorAll('script[src], link[href], img[src], video[src], audio[src], source[src], object[data], link[rel="icon"], link[rel="stylesheet"], [style]');

        for (const element of elements) {
            let url = element.src || element.href || element.data;

            if (element.tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
                await processLocalCSS(element.href);
            }
            if (element.hasAttribute('style')) {
                // Process inline styles
                extractUrlsFromStyle(element.getAttribute('style'));
            }
            if (url) {
                addUrl(url);
            }
        }

        // Scan for embedded resources within <source> tags inside <video> and <audio> elements
        document.querySelectorAll('video > source, audio > source').forEach((source) => {
            const src = source.src;
            if (src) {
                addUrl(src);
            }
        });

        return [...urls];
    }

    function domReady(callback) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // DOM is already ready
            callback();
        } else {
            // Listen for DOMContentLoaded event
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

})();