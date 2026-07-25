import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');
const OUTPUT_DIR = path.resolve('locales');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const langs = fs.readdirSync(SOURCES_DIR).filter(f =>
  fs.statSync(path.join(SOURCES_DIR, f)).isDirectory()
);

for (const lang of langs) {
  const langDir = path.join(SOURCES_DIR, lang);
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.yaml')).sort();
  const bundle: Record<string, any> = {};

  for (const file of files) {
    const ns = file.replace('.yaml', '');
    const content = yaml.load(fs.readFileSync(path.join(langDir, file), 'utf-8')) as Record<string, any>;
    bundle[ns] = content[ns];
  }

  // 读取语言目录下的元数据
  const metaPath = path.join(langDir, 'meta.yaml');
  const info = fs.existsSync(metaPath)
    ? (yaml.load(fs.readFileSync(metaPath, 'utf-8')) as Record<string, any>)
    : {};
  const wrapped = {
    version: 1,
    lang,
    name: info.name || lang,
    nativeName: info.nativeName || info.name || lang,
    rtl: info.rtl || false,
    translations: bundle,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${lang}.json`),
    JSON.stringify(wrapped, null, 2)
  );
  console.log(`Built ${lang}.json`);
}
