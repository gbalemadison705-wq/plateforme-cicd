/**
 * Serveur web pour heberger les sites deploys
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = 8000;
const DEPLOY_DIR = path.join(__dirname, 'storage', 'deployments');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function handleRequest(req, res) {
  try {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Extraire le site demande (ex: /sites/site_4/index.html)
    const match = pathname.match(/^\/sites\/(site_\d+)(\/.*)?$/);
    
    if (!match) {
      res.writeHead(404);
      res.end('Site non trouve');
      return;
    }
    
    const siteId = match[1];
    const filePath = match[2] || '/index.html';
    
    // Construire le chemin complet
    const fullPath = path.join(DEPLOY_DIR, siteId, filePath);
    
    // Lire le fichier
    const content = await fs.readFile(fullPath);
    
    // Determiner le type MIME
    const ext = path.extname(fullPath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Fichier non trouve');
    } else {
      res.writeHead(500);
      res.end('Erreur serveur');
    }
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   SERVEUR WEB - SITES DEPLOYS         ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📁 Dossier: ${DEPLOY_DIR}`);
  console.log('✅ Pret a servir les sites !');
  console.log('');
});