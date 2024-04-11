/**
 * Module pour gérer les raccourcis claviers
 * Les raccourcis sont définis dans le tableau `shortcuts`
 * Tous les raccourcis commencent par $$
 * 
 * @example 
 *         {
 *            name: 'mon raccourcis', // nom du raccourcis
 *            sequence: ['e'], // séquence de touches (après les deux $ obligatoires)
 *            target: true, // option permettant d'effectuer l'action du raccourcis clavier dans une nouvelle fenetre en ajoutant ! après $
 *                          // Exemple : $-e pour éditer, $-!-e pour éditer dans une nouvelle fenetre
 *            action: (target = '_self') => {
 *              // code de la fonction exécutée (le parametre target est facultatif)
 *            }
 *        },
 * 
 */
cfhs.modules.shortcuts = (() => {
    const urlHostname = new URL(window.location.href).hostname;

    const shortcuts = [
        {
            name: 'Vider le cache CloudFlare et recharger la page',
            sequence: ['r'],
            action: () => {

                const selector = prompt("Purger les pages du domaine", urlHostname);
                if (!selector) return;
                fetch('https://cloudflare.coworking-metz.fr/purge?selector=' + selector).then(() => {
                    document.location.reload(true);
                })
            }
        },
        {
            name: 'Lister les pages en cache CloudFlare pour ce domaine',
            sequence: ['l'],
            action: () => {

                const selector = prompt("Lister les pages en cache CloudFalre pour le domaine:", urlHostname);
                if (!selector) return;
                fetch('https://cloudflare.coworking-metz.fr/list?selector=' + selector).then(response => response.json()).then(list => {
                    console.log(list)
                })
            }
        }

    ];


    let stream = [];

    return {
        open(url, target) {
            if (url) {
                if (target == 'popup') {
                    popupCenter({ url })
                } else {
                    window.open(url, target);
                }
            }

        },
        getStream() {
            ['hashchange', 'load'].forEach(evenement => {
                window.addEventListener(evenement, () => {
                    let hash = document.location.hash.replace('#', '');
                    if (!hash.includes('$$')) return;
                    if (!hash.includes('$$!')) { hash = hash.replaceAll('$$', '$$$$!'); }
                    this.checkStream(hash.split('').join('-'));
                });
            });
            document.addEventListener("keydown", (e) => {
                const key = e.key;
                const tag = e.target.tagName.toLowerCase();
                let clear = false;
                if (tag == 'input' || tag == 'textarea') {
                    clear = true;
                }
                if (key == 'Backspace' || key == 'Escape' || key == 'Delete') {
                    clear = true;
                }
                let unique = false;
                if (key == 'Control' || key == 'Shift' || key == 'Alt') {
                    unique = true;
                }
                if (clear) {
                    this.clearStream();
                } else {
                    attendre('stream', this.clearStream, 2000);

                    if (!unique || !stream.includes(key)) {
                        stream.push(key);
                        this.checkStream();
                    }
                }
            });
        },
        checkStream(streamStr = false) {
            streamStr = streamStr ? streamStr : stream.join('-');
            shortcuts.forEach(shortcut => {
                let sequenceStr = '$-$-' + shortcut.sequence.map(element => element.split('').join('-')).join('-');
                if (streamStr.endsWith(sequenceStr)) {
                    shortcut.action();
                    this.clearStream();
                } else if (shortcut.target && streamStr.includes('$-$-!-')) {
                    sequenceStr = sequenceStr.replace('$-$-', '$-$-!-');
                    if (streamStr.endsWith(sequenceStr)) {
                        shortcut.action('_blank');
                        this.clearStream();
                    }
                } else if (shortcut.target && streamStr.includes('$-$-+-')) {
                    sequenceStr = sequenceStr.replace('$-$-', '$-$-+-');
                    if (streamStr.endsWith(sequenceStr)) {
                        shortcut.action('popup');
                        this.clearStream();
                    }
                }
            })
        },
        clearStream() {
            stream = [];
        },
        start() {
            this.getStream();
        }
    }
})();

cfhs.modules.shortcuts.start()