// 追加插件开关相关文案（只追加缺失行，不重排既有内容）。
// 用法：cd vendor/translations && bun run scripts/add-plugin-toggle-keys.ts
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');

const settingsKeys: Record<string, Record<string, string>> = {
  pluginFileDisabled: {
    'zh-CN': '该文件类型所属的插件已停用，无法打开',
    'zh-TW': '該檔案類型所屬的外掛已停用，無法開啟',
    'en-US': 'The plugin for this file type is disabled, so it cannot be opened',
    'ja-JP': 'このファイルタイプのプラグインは無効になっているため、開けません',
    'ko-KR': '이 파일 형식의 플러그인이 비활성화되어 열 수 없습니다',
    'fr-FR': "Le plugin de ce type de fichier est désactivé, impossible de l'ouvrir",
    'de-DE': 'Das Plugin für diesen Dateityp ist deaktiviert und kann nicht geöffnet werden',
    'es-ES': 'El complemento de este tipo de archivo está desactivado, no se puede abrir',
    'it-IT': 'Il plugin per questo tipo di file è disattivato, impossibile aprirlo',
    'pt-PT': 'O plugin para este tipo de ficheiro está desativado, não é possível abri-lo',
    'ru-RU': 'Плагин для этого типа файлов отключён, открыть нельзя',
    'ar-SA': 'الإضافة الخاصة بهذا النوع من الملفات معطّلة، فلا يمكن فتحه',
    'hi-IN': 'इस फ़ाइल प्रकार का प्लगइन बंद है, इसे खोला नहीं जा सकता',
    'vi-VN': 'Plugin cho loại tệp này đã bị tắt nên không thể mở',
    'th-TH': 'ปลั๊กอินสำหรับไฟล์ประเภทนี้ถูกปิดอยู่ จึงเปิดไม่ได้',
  },
};

const excalidrawKeys: Record<string, Record<string, string>> = {
  pluginName: {
    'zh-CN': 'Excalidraw 白板',
    'zh-TW': 'Excalidraw 白板',
    'en-US': 'Excalidraw Whiteboard',
    'ja-JP': 'Excalidraw ホワイトボード',
    'ko-KR': 'Excalidraw 화이트보드',
    'fr-FR': 'Tableau blanc Excalidraw',
    'de-DE': 'Excalidraw-Whiteboard',
    'es-ES': 'Pizarra Excalidraw',
    'it-IT': 'Lavagna Excalidraw',
    'pt-PT': 'Quadro branco Excalidraw',
    'ru-RU': 'Доска Excalidraw',
    'ar-SA': 'لوح Excalidraw',
    'hi-IN': 'Excalidraw व्हाइटबोर्ड',
    'vi-VN': 'Bảng trắng Excalidraw',
    'th-TH': 'ไวท์บอร์ด Excalidraw',
  },
  pluginDescription: {
    'zh-CN': '在 Markdown 中内嵌、打开并保存 Excalidraw 白板（.excalidraw 文件）',
    'zh-TW': '在 Markdown 中內嵌、開啟並儲存 Excalidraw 白板（.excalidraw 檔案）',
    'en-US': 'Embed, open and save Excalidraw whiteboards (.excalidraw files) in Markdown',
    'ja-JP': 'Markdown に Excalidraw ホワイトボード（.excalidraw ファイル）を埋め込み、開いて保存します',
    'ko-KR': 'Markdown에 Excalidraw 화이트보드(.excalidraw 파일)를 삽입하고 열고 저장합니다',
    'fr-FR': 'Intégrez, ouvrez et enregistrez des tableaux blancs Excalidraw (fichiers .excalidraw) dans le Markdown',
    'de-DE': 'Excalidraw-Whiteboards (.excalidraw-Dateien) in Markdown einbetten, öffnen und speichern',
    'es-ES': 'Inserta, abre y guarda pizarras Excalidraw (archivos .excalidraw) en Markdown',
    'it-IT': 'Incorpora, apri e salva lavagne Excalidraw (file .excalidraw) nel Markdown',
    'pt-PT': 'Incorpore, abra e guarde quadros brancos Excalidraw (ficheiros .excalidraw) no Markdown',
    'ru-RU': 'Встраивайте, открывайте и сохраняйте доски Excalidraw (файлы .excalidraw) в Markdown',
    'ar-SA': 'ضمّن لوحات Excalidraw (ملفات .excalidraw) وافتحها واحفظها في Markdown',
    'hi-IN': 'Markdown में Excalidraw व्हाइटबोर्ड (.excalidraw फ़ाइलें) एम्बेड, खोलें और सहेजें',
    'vi-VN': 'Nhúng, mở và lưu bảng trắng Excalidraw (tệp .excalidraw) trong Markdown',
    'th-TH': 'ฝัง เปิด และบันทึกไวท์บอร์ด Excalidraw (ไฟล์ .excalidraw) ใน Markdown',
  },
};

function appendKeys(
  filePath: string,
  rootKey: string,
  keys: Record<string, Record<string, string>>,
  lang: string,
): number {
  if (!fs.existsSync(filePath)) return 0;
  const original = fs.readFileSync(filePath, 'utf-8');
  const content = yaml.load(original) as Record<string, any> | undefined;
  const root = content?.[rootKey];
  if (!root || typeof root !== 'object') return 0;

  const lines: string[] = [];
  for (const [key, translations] of Object.entries(keys)) {
    const value = translations[lang];
    if (!value || root[key] !== undefined) continue;
    // lineWidth: -1 —— 关闭默认的 80 列折行。否则长句会被 dump 成 `>-` 折叠块，
    // 其续行缩进与键同层，追加后会变成非法 YAML（且脚本无法再次解析）。
    lines.push(`  ${key}: ${yaml.dump(value, { lineWidth: -1 }).trimEnd()}`);
  }
  if (lines.length === 0) return 0;

  const separator = original.endsWith('\n') ? '' : '\n';
  fs.writeFileSync(filePath, original + separator + lines.join('\n') + '\n');
  return lines.length;
}

const langs = fs
  .readdirSync(SOURCES_DIR)
  .filter((f) => fs.statSync(path.join(SOURCES_DIR, f)).isDirectory());

for (const lang of langs) {
  const settingsCount = appendKeys(
    path.join(SOURCES_DIR, lang, 'settings.yaml'),
    'settings',
    settingsKeys,
    lang,
  );
  const excalidrawCount = appendKeys(
    path.join(SOURCES_DIR, lang, 'excalidraw.yaml'),
    'excalidraw',
    excalidrawKeys,
    lang,
  );
  console.log(`${lang}: settings +${settingsCount}, excalidraw +${excalidrawCount}`);
}
