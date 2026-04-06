require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('使い方: pnpm image <出力先ディレクトリ> <プロンプト>');
    console.error('例: pnpm image slides/report "ビジネス成長を表すイラスト、フラットデザイン"');
    console.error('\n環境変数 GEMINI_API_KEY が必要です。');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('エラー: 環境変数 GEMINI_API_KEY を設定してください。');
    console.error('  export GEMINI_API_KEY="your-api-key"');
    process.exit(1);
  }

  const outputDir = path.resolve(args[0]);
  const prompt = args.slice(1).join(' ');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n🎨 画像を生成中...\n   プロンプト: "${prompt}"\n`);

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: `Generate an image: ${prompt}\n\nStyle requirements: Clean, professional, suitable for business presentations. No text in the image.`,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '16:9',
        imageSize: '2K',
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  let imageFound = false;

  for (const part of parts) {
    if (part.inlineData) {
      const ext = part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg';
      const timestamp = Date.now();
      const filename = `generated_${timestamp}.${ext}`;
      const filepath = path.join(outputDir, filename);

      const buffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync(filepath, buffer);

      console.log(`✅ 画像を保存しました: ${filepath}`);
      console.log(`\n   スライドHTMLで使用する場合:`);
      console.log(`   <img src="${filename}" class="..." />\n`);
      imageFound = true;
    }
  }

  if (!imageFound) {
    console.error('⚠️  画像が生成されませんでした。プロンプトを変えて再試行してください。');
    for (const part of parts) {
      if (part.text) {
        console.log(`   Geminiの応答: ${part.text}`);
      }
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('画像生成エラー:', err.message);
  process.exit(1);
});
