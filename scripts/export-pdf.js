const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

async function exportSlideToPdf(browser, filePath) {
  const page = await browser.newPage();
  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

  const absolutePath = path.resolve(filePath);
  await page.goto(`file://${absolutePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Tailwind CDNの読み込みを待つ
  await new Promise(r => setTimeout(r, 2000));

  const pdfBuffer = await page.pdf({
    width: `${SLIDE_WIDTH}px`,
    height: `${SLIDE_HEIGHT}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await page.close();
  return pdfBuffer;
}

async function mergePdfs(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  return await mergedPdf.save();
}

async function main() {
  const args = process.argv.slice(2);
  const slideDir = args[0] || 'slides/sample';
  const outputFile = args[1] || `output/${path.basename(slideDir)}.pdf`;

  const dir = path.resolve(slideDir);
  if (!fs.existsSync(dir)) {
    console.error(`ディレクトリが見つかりません: ${dir}`);
    process.exit(1);
  }

  const slideFiles = fs.readdirSync(dir)
    .filter(f => f.match(/^slide_\d+\.html$/))
    .sort()
    .map(f => path.join(dir, f));

  if (slideFiles.length === 0) {
    console.log('スライドが見つかりません。');
    process.exit(0);
  }

  console.log(`\n📄 ${slideFiles.length} 枚のスライドをPDFに変換中...\n`);

  const browser = await puppeteer.launch({ headless: true });
  const pdfBuffers = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const name = path.basename(slideFiles[i]);
    process.stdout.write(`  ${i + 1}/${slideFiles.length} ${name}...`);
    const buf = await exportSlideToPdf(browser, slideFiles[i]);
    pdfBuffers.push(buf);
    console.log(' ✅');
  }

  await browser.close();

  console.log('\n📎 PDFを結合中...');
  const merged = await mergePdfs(pdfBuffers);

  const outputPath = path.resolve(outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, merged);

  console.log(`\n✅ PDF出力完了: ${outputPath}\n`);
}

main().catch(err => {
  console.error('PDF出力エラー:', err);
  process.exit(1);
});
