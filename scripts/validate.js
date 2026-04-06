const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const MIN_MARGIN = 8;

async function validateSlide(browser, filePath) {
  const page = await browser.newPage();
  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

  const absolutePath = path.resolve(filePath);
  await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Tailwind CDNの読み込みを待つ
  await page.waitForFunction(() => {
    return document.querySelector('[class]') !== null;
  }, { timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  const issues = await page.evaluate((slideW, slideH, minMargin) => {
    const problems = [];
    const elements = document.querySelectorAll('body *');
    const rects = [];

    for (const el of elements) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      // overflow:hidden の親を持つ装飾要素はスキップ
      let parent = el.parentElement;
      let clippedByParent = false;
      while (parent) {
        const ps = getComputedStyle(parent);
        if (ps.overflow === 'hidden' || ps.overflowX === 'hidden' || ps.overflowY === 'hidden') {
          clippedByParent = true;
          break;
        }
        parent = parent.parentElement;
      }

      // はみ出しチェック（overflow:hiddenでクリップされる場合はスキップ）
      if (!clippedByParent && rect.right > slideW + 2) {
        problems.push({
          type: 'overflow',
          severity: 'error',
          message: `要素が右にはみ出し: ${el.tagName}.${el.className.toString().slice(0, 50)} (right: ${Math.round(rect.right)}px, slide: ${slideW}px)`,
        });
      }
      if (!clippedByParent && rect.bottom > slideH + 2) {
        problems.push({
          type: 'overflow',
          severity: 'error',
          message: `要素が下にはみ出し: ${el.tagName}.${el.className.toString().slice(0, 50)} (bottom: ${Math.round(rect.bottom)}px, slide: ${slideH}px)`,
        });
      }

      // テキスト要素のみ重なり・余白チェック対象
      const isTextEl = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'LI', 'TD', 'TH', 'LABEL'].includes(el.tagName);
      if (isTextEl && rect.width > 10 && rect.height > 10) {
        rects.push({
          tag: el.tagName,
          cls: el.className.toString().slice(0, 40),
          top: rect.top, left: rect.left,
          right: rect.right, bottom: rect.bottom,
          width: rect.width, height: rect.height,
        });
      }
    }

    // 重なりチェック（テキスト要素間のみ）
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const overlapArea = overlapX * overlapY;
        const minArea = Math.min(a.width * a.height, b.width * b.height);

        if (overlapArea > minArea * 0.3) {
          problems.push({
            type: 'overlap',
            severity: 'warning',
            message: `要素の重なり: ${a.tag}.${a.cls} と ${b.tag}.${b.cls} (重なり面積: ${Math.round(overlapArea)}px²)`,
          });
        }
      }
    }

    // 余白不足チェック（隣接テキスト要素間）
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        const gapX = Math.max(b.left - a.right, a.left - b.right);
        const gapY = Math.max(b.top - a.bottom, a.top - b.bottom);

        // 縦方向に近い要素
        if (gapX < 0 && gapY >= 0 && gapY < minMargin && gapY > 0) {
          problems.push({
            type: 'margin',
            severity: 'info',
            message: `余白不足: ${a.tag}.${a.cls} と ${b.tag}.${b.cls} (間隔: ${Math.round(gapY)}px, 推奨: ${minMargin}px以上)`,
          });
        }
      }
    }

    return problems;
  }, SLIDE_WIDTH, SLIDE_HEIGHT, MIN_MARGIN);

  await page.close();
  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  let slideDir = args[0] || 'slides/sample';
  let targetFile = null;

  // 特定ファイルが指定された場合
  if (args[0] && args[0].endsWith('.html') && !args[0].includes('viewer')) {
    targetFile = args[0];
    slideDir = path.dirname(args[0]);
  }

  const slideFiles = [];
  if (targetFile) {
    slideFiles.push(targetFile);
  } else {
    const dir = path.resolve(slideDir);
    if (!fs.existsSync(dir)) {
      console.error(`ディレクトリが見つかりません: ${dir}`);
      process.exit(1);
    }
    const files = fs.readdirSync(dir)
      .filter(f => f.match(/^slide_\d+\.html$/))
      .sort();
    slideFiles.push(...files.map(f => path.join(dir, f)));
  }

  if (slideFiles.length === 0) {
    console.log('チェック対象のスライドが見つかりません。');
    process.exit(0);
  }

  console.log(`\n🔍 ${slideFiles.length} 枚のスライドをチェック中...\n`);

  const browser = await puppeteer.launch({ headless: true });
  let totalIssues = 0;

  for (const file of slideFiles) {
    const name = path.basename(file);
    const issues = await validateSlide(browser, file);

    if (issues.length === 0) {
      console.log(`  ✅ ${name} — 問題なし`);
    } else {
      const errors = issues.filter(i => i.severity === 'error');
      const warnings = issues.filter(i => i.severity === 'warning');
      const infos = issues.filter(i => i.severity === 'info');

      console.log(`  ❌ ${name} — ${issues.length} 件の問題`);
      for (const issue of errors) {
        console.log(`     🔴 ${issue.message}`);
      }
      for (const issue of warnings) {
        console.log(`     🟡 ${issue.message}`);
      }
      for (const issue of infos) {
        console.log(`     🔵 ${issue.message}`);
      }
      totalIssues += issues.length;
    }
  }

  await browser.close();

  console.log(`\n${'─'.repeat(50)}`);
  if (totalIssues === 0) {
    console.log('✅ すべてのスライドが正常です。\n');
  } else {
    console.log(`⚠️  ${totalIssues} 件の問題が見つかりました。\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('バリデーションエラー:', err);
  process.exit(1);
});
