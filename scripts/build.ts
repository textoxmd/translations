import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { parse as parseToml } from 'smol-toml';

const SOURCES_DIR = path.resolve('sources');
const OUTPUT_DIR = path.resolve('locales');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const filterLang = process.argv.find(a => a.startsWith('--lang='))?.split('=')[1];

const langs = fs.readdirSync(SOURCES_DIR).filter(f =>
  fs.statSync(path.join(SOURCES_DIR, f)).isDirectory() && (!filterLang || f === filterLang)
);

for (const dir of langs) {
  const langDir = path.join(SOURCES_DIR, dir);

  // 读取 meta.toml
  const metaPath = path.join(langDir, 'meta.toml');
  if (!fs.existsSync(metaPath)) {
    console.warn(`Skipping ${dir}: no meta.toml`);
    continue;
  }
  const meta = parseToml(fs.readFileSync(metaPath, 'utf-8')) as Record<string, any>;
  const lang = meta.lang || dir;

  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.yaml')).sort();
  const bundle: Record<string, any> = {};

  for (const file of files) {
    const ns = file.replace('.yaml', '');
    const content = yaml.load(fs.readFileSync(path.join(langDir, file), 'utf-8')) as Record<string, any>;
    bundle[ns] = content[ns];
  }

  const wrapped = {
    version: 1,
    lang,
    name: meta.name || lang,
    nativeName: meta.nativeName || meta.name || lang,
    rtl: meta.rtl || false,
    translations: bundle,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${lang}.json`),
    JSON.stringify(wrapped, null, 2)
  );
  console.log(`Built ${lang}.json`);
}
