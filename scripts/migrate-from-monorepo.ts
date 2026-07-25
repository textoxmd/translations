import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SUPPORTED_LANGUAGES = [
  'zh-CN', 'zh-TW', 'en-US', 'ja-JP', 'ko-KR',
  'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT',
  'ru-RU', 'ar-SA', 'hi-IN', 'vi-VN', 'th-TH',
];

const SRC = path.resolve('../textox/src/i18n/translations');
const DST = path.resolve('sources');

function extractLanguage(obj: any, lang: string): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  const keys = Object.keys(obj);
  const hasLanguageKeys = keys.some(key => SUPPORTED_LANGUAGES.includes(key));

  if (hasLanguageKeys) {
    return obj[lang] ?? '';
  }

  const result: any = {};
  for (const key of keys) {
    const value = extractLanguage(obj[key], lang);
    if (value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result;
}

// 读取所有原始 YAML
const modules: Record<string, any> = {};
const files = fs.readdirSync(SRC).filter(f => f.endsWith('.yaml')).sort();

for (const file of files) {
  const content = yaml.load(fs.readFileSync(path.join(SRC, file), 'utf-8')) as Record<string, any>;
  Object.assign(modules, content);
}

// 按语言提取并写入
for (const lang of SUPPORTED_LANGUAGES) {
  const langDir = path.join(DST, lang);
  fs.mkdirSync(langDir, { recursive: true });

  for (const [ns, data] of Object.entries(modules)) {
    const extracted = extractLanguage(data, lang);
    if (extracted && Object.keys(extracted).length > 0) {
      const output = { [ns]: extracted };
      fs.writeFileSync(
        path.join(langDir, `${ns}.yaml`),
        yaml.dump(output, { lineWidth: 120, noRefs: true })
      );
    }
  }

  const count = fs.readdirSync(langDir).length;
  console.log(`Wrote sources/${lang}/ (${count} modules)`);
}
