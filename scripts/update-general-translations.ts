import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');

const translations: Record<string, string> = {
  'zh-CN': '通用',
  'zh-TW': '通用',
  'en-US': 'General',
  'ja-JP': '一般',
  'ko-KR': '일반',
  'fr-FR': 'Général',
  'de-DE': 'Allgemein',
  'es-ES': 'General',
  'it-IT': 'Generale',
  'pt-PT': 'Geral',
  'ru-RU': 'Общие',
  'ar-SA': 'عام',
  'hi-IN': 'सामान्य',
  'vi-VN': 'Tổng quát',
  'th-TH': 'ทั่วไป',
};

const langs = fs.readdirSync(SOURCES_DIR).filter(f =>
  fs.statSync(path.join(SOURCES_DIR, f)).isDirectory()
);

for (const lang of langs) {
  const settingsPath = path.join(SOURCES_DIR, lang, 'settings.yaml');
  if (!fs.existsSync(settingsPath)) continue;

  const content = yaml.load(fs.readFileSync(settingsPath, 'utf-8')) as Record<string, any>;
  if (content.settings?.general) {
    const newVal = translations[lang];
    if (newVal) {
      content.settings.general = newVal;
      fs.writeFileSync(settingsPath, yaml.dump(content, { lineWidth: 120, noRefs: true }));
      console.log(`${lang}: "${content.settings.general}" → "${newVal}"`);
    }
  }
}
