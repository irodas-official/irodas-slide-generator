const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const deckName = args[0];

if (!deckName) {
  console.error('使い方: npm run new <deck-name>');
  console.error('例: npm run new -- quarterly-report');
  process.exit(1);
}

const deckDir = path.resolve('slides', deckName);

if (fs.existsSync(deckDir)) {
  console.error(`既に存在します: ${deckDir}`);
  process.exit(1);
}

fs.mkdirSync(deckDir, { recursive: true });

// viewer.htmlをコピー
const viewerTemplate = fs.readFileSync(path.resolve('templates/viewer.html'), 'utf-8');
const viewer = viewerTemplate
  .replace(/\{\{DECK_TITLE\}\}/g, deckName)
  .replace('{{SLIDES_JSON}}', '// スライドはここに追加されます');
fs.writeFileSync(path.join(deckDir, 'viewer.html'), viewer);

console.log(`\n✅ 新しいスライドデッキを作成しました: ${deckDir}`);
console.log(`\n  slides/${deckName}/`);
console.log(`  ├── viewer.html    (ビューア)`);
console.log(`  └── slide_01.html  (ここからスライドを追加)\n`);
console.log(`テンプレートは templates/ を参照してください。\n`);
