import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');
const langs = fs.readdirSync(SOURCES_DIR).filter(f =>
  fs.statSync(path.join(SOURCES_DIR, f)).isDirectory()
);

// en-US 为标准模板
const enDir = path.join(SOURCES_DIR, 'en-US');
const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.yaml')).sort();
const enKeys: Record<string, string[]> = {};

for (const file of enFiles) {
  const content = yaml.load(fs.readFileSync(path.join(enDir, file), 'utf-8')) as Record<string, any>;
  const ns = file.replace('.yaml', '');
  enKeys[ns] = Object.keys(content[ns]);
}

let hasError = false;

for (const lang of langs) {
  if (lang === 'en-US') continue;
  const langDir = path.join(SOURCES_DIR, lang);

  // 检查模块文件完整性
  const langFiles = fs.readdirSync(langDir).filter(f => f.endsWith('.yaml')).sort();
  for (const file of enFiles) {
    if (!langFiles.includes(file)) {
      console.error(`ERROR: ${lang}/${file} 缺失`);
      hasError = true;
    }
  }

  // 检查 key 完整性
  for (const file of enFiles) {
    if (!langFiles.includes(file)) continue;
    try {
      const content = yaml.load(fs.readFileSync(path.join(langDir, file), 'utf-8')) as Record<string, any>;
      const ns = file.replace('.yaml', '');
      const missing = enKeys[ns].filter(k => !(k in (content[ns] || {})));
      for (const k of missing) {
        console.warn(`WARN: ${lang}/${ns} 缺少 key: ${k}`);
      }
    } catch (e: any) {
      console.error(`ERROR: ${lang}/${file} YAML 格式错误: ${e.message}`);
      hasError = true;
    }
  }
}

if (hasError) process.exit(1);
console.log('All validations passed.');
