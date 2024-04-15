

function doScan() {
    current = window.location.href;
    if (prec == current) return;
    prec = current;

    console.log('cf.js - scan');
    fetch(current, { cache: "force-cache" }).then(async (response) => {
        // Accessing specific header
        // console.log(response.headers.get('Content-Type'));

        const cfCacheStatus = response.headers.get('cf-cache-status');
        // const statuses = ['HIT', 'MISS', 'EXPIRED'];

        // if (statuses.includes(cfCacheStatus)) {
            console.log('cf.js - ' + cfCacheStatus);
            const urls = await findStaticAssetsUrls();
            // console.log({ urls });

            urls.push(removeQueryParams(current,['debug','nocache','test']));
            fetch('https://cloudflare.coworking-metz.fr/hit', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urls })
            });

        // } else {
        //     console.log('cf.js - nothing to do');
        // }
    }).catch(error => {
        console.error('cf.js - Error fetching headers:', error);
    });
}