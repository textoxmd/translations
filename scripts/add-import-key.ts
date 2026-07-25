import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');
const NEW_KEY = 'import_translations';

const translations: Record<string, string> = {
  'zh-CN': '导入翻译...',
  'zh-TW': '導入翻譯...',
  'en-US': 'Import Translations...',
  'ja-JP': '翻訳をインポート...',
  'ko-KR': '번역 가져오기...',
  'fr-FR': 'Importer des traductions...',
  'de-DE': 'Übersetzungen importieren...',
  'es-ES': 'Importar traducciones...',
  'it-IT': 'Importa traduzioni...',
  'pt-PT': 'Importar traduções...',
  'ru-RU': 'Импорт переводов...',
  'ar-SA': 'استيراد الترجمات...',
  'hi-IN': 'अनुवाद आयात करें...',
  'vi-VN': 'Nhập bản dịch...',
  'th-TH': 'นำเข้าคำแปล...',
};

const langs = fs.readdirSync(SOURCES_DIR).filter(f =>
  fs.statSync(path.join(SOURCES_DIR, f)).isDirectory()
);

for (const lang of langs) {
  const menuPath = path.join(SOURCES_DIR, lang, 'menu.yaml');
  if (!fs.existsSync(menuPath)) continue;

  const content = yaml.load(fs.readFileSync(menuPath, 'utf-8')) as Record<string, any>;
  const value = translations[lang] || translations['en-US'] || NEW_KEY;

  // Check if key already exists
  if (content.menu && content.menu[NEW_KEY] !== undefined) {
    console.log(`${lang}: key already exists, skipping`);
    continue;
  }

  // Insert after `open_location`
  const newMenu: Record<string, any> = {};
  for (const [key, val] of Object.entries(content.menu)) {
    newMenu[key] = val;
    if (key === 'open_location') {
      newMenu[NEW_KEY] = value;
    }
  }

  content.menu = newMenu;
  fs.writeFileSync(menuPath, yaml.dump(content, { lineWidth: 120, noRefs: true }));
  console.log(`${lang}: added ${NEW_KEY} = "${value}"`);
}
