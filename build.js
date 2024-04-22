const fs = require('fs');
const { marked } = require('marked');

// Read the README.md file
fs.readFile('README.md', 'utf8', (err, markdown) => {
    if (err) {
        console.error('Error reading the README.md file:', err);
        return;
    }

    // Convert Markdown to HTML
    const content = marked.parse(markdown);

    // Construct full HTML document
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
/>
<script type="text/javascript" defer async src="https://cloudflare.coworking-metz.fr/cf.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudFlare Hit & Scan</title>
</head>
<body>
<header class="container"><center><img width="128" src="https://www.coworking-metz.fr/favicon/android-chrome-512x512.png"><center></header>
<main class="container">
    ${content}
    </main>
</body>
</html>`;

    // Write the HTML to index.html
    fs.writeFile('index.html', html, err => {
        if (err) {
            console.error('Error writing the index.html file:', err);
        } else {
            console.log('index.html has been generated from README.md');
        }
    });
});
