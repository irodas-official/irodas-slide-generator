const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const args = process.argv.slice(2);
const deck = args[0];

if (!deck) {
  console.error('使い方: pnpm preview <deck-name>');
  console.error('例: pnpm preview sample');
  process.exit(1);
}

const deckDir = path.resolve('slides', deck);
if (!fs.existsSync(path.join(deckDir, 'viewer.html'))) {
  console.error(`見つかりません: ${deckDir}/viewer.html`);
  process.exit(1);
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const filePath = path.join(deckDir, req.url === '/' ? 'viewer.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = 3210;
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🖥  プレビュー: ${url}`);
  console.log(`   デッキ: slides/${deck}/`);
  console.log(`   終了: Ctrl+C\n`);

  // ブラウザを自動で開く
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} ${url}`);
});
