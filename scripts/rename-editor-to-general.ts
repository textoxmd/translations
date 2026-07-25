import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');
const langs = fs.readdirSync(SOURCES_DIR).filter(f =>
  fs.statSync(path.join(SOURCES_DIR, f)).isDirectory()
);

for (const lang of langs) {
  const settingsPath = path.join(SOURCES_DIR, lang, 'settings.yaml');
  if (!fs.existsSync(settingsPath)) continue;

  const content = yaml.load(fs.readFileSync(settingsPath, 'utf-8')) as Record<string, any>;
  const s = content.settings;
  if (!s) continue;

  // Rename editor → general
  if (s.editor !== undefined && s.general === undefined) {
    s.general = s.editor;
    delete s.editor;
  }

  // Add clearError if missing
  const clearError: Record<string, string> = {
    'zh-CN': '清除失败',
    'zh-TW': '清除失敗',
    'en-US': 'Failed to clear',
    'ja-JP': 'クリアに失敗しました',
    'ko-KR': '지우기 실패',
    'fr-FR': 'Échec de l\'effacement',
    'de-DE': 'Löschen fehlgeschlagen',
    'es-ES': 'Error al borrar',
    'it-IT': 'Cancellazione fallita',
    'pt-PT': 'Falha ao limpar',
    'ru-RU': 'Не удалось очистить',
    'ar-SA': 'فشل المسح',
    'hi-IN': 'साफ़ करने में विफल',
    'vi-VN': 'Xóa thất bại',
    'th-TH': 'ล้างไม่สำเร็จ',
  };
  if (s.clearError === undefined && clearError[lang]) {
    s.clearError = clearError[lang];
  }

  fs.writeFileSync(settingsPath, yaml.dump(content, { lineWidth: 120, noRefs: true }));
  console.log(`Updated ${lang}/settings.yaml`);
}
