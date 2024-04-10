# Cloudflare Hit & Scan

Nativement, CloudFalre ne permet pas une purge sur une sélection d'urls via un sélecteur de type '*mot*'.

Cet outil permet de créer un inventaire des urls qui sont en cache dans cloudflare. Le but est de pouvoir ensuite sélectionner une partie de ses urls pour en demander la purge, sans avoir à purger toute la zone. 


## Fonctionnement
Pour les pages web, ajouter le tag suivant dans la page
```html
<script type="text/javascript" defer async src="https://cloudflare.coworking-metz.fr/cf.js"></script>
```

Il se chargera de détecter tous les assets de la page qui sont mis en cache dans CloudFlare, et d'en envoyer la liste au endpoint `/hit`


Dans le cas de fichiers générés côté serveur, (comme les polaroids), on utilisera directement le endpoint `/hit`.

## Endpoints

### `/hit`
Le endpoint `/hit` va inventorier une liste d'urls. Appeler le endpoint via une requète GET ou POST avec une chaîne de caractère `url` ou un tableau `urls` contenant la ou les urls à inventorier.

```
https://cloudflare.coworking-metz.fr/hit?url=https://photos.coworking-metz.fr/polaroid/size/big/classic/225.jpg&verbose=true
```

L'ajout d'un paramètre facultatif booléen `verbose` permet de voir la liste des urls effectivement inventoriées (1)

### `/purge`
 Le endpoint `/purge` permet de purger le cache d'une sélection d'urls. Pour sélectionner les urls, il faut envoyer une chaîne de caractère `selector`. Toutes les pages dont l'url contient le mot contenu dans `selector` seront purgées (Ne pas inclure de `*` ou autre regexp dans selector).
 On peut combiner plusieurs critères différents dans `selector` en séparant chaque terme par une virugle `,`.
 L'ajout d'un paramètre facultatif booléen `verbose` permet de voir la liste des urls purgées

#### Purger les fichier css
```
https://cloudflare.coworking-metz.fr/purge?selector=css&verbose=true
```
#### Purger les urls du domaine pages.coworking-metz.fr
```
https://cloudflare.coworking-metz.fr/purge?selector=pages.coworking-metz.fr&verbose=true
```
#### Purger les urls des domaines pages.coworking-metz.fr et www.coworking-metz.fr
```
https://cloudflare.coworking-metz.fr/purge?selector=pages.coworking-metz.fr,www.coworking-metz.fr&verbose=true
```

### `/list`
 Le endpoint `/list` n'effectue aucune action. Il permet simplement de visualiser les urls inventoriées pour un selecteur donné. Pour sélectionner les urls, il faut envoyer une chaîne de caractère `selector`. Toutes les pages dont l'url contient le mot contenu dans `selector` seront listées (Ne pas inclure de `*` ou autre regexp dans selector).
 On peut combiner plusieurs critères différents dans `selector` en séparant chaque terme par une virugle `,`.
_

1: certaines URL ne sont pas censées être mises en cache par CloudFlare, comme celle contenant une extension `.php` ou un query param `nocache` par exemple. Le endpoint `/hit` va donc les ignorer et ne pas les inventorier.