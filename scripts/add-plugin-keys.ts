// 补齐插件相关设置项的文案（首次引入插件功能时用）。
//
// 用法：cd vendor/translations && bun run scripts/add-plugin-keys.ts
//
// 与 add-settings-keys.ts 的差别：那个脚本把整个 YAML 解析后重新 dump，长句会被
// 重新折行（语义不变），在 15 个文件上会产生几十行无关 diff。这里改成**只追加新行**：
// 文件末尾补上缺失的键，其余内容逐字节不动，diff 里只有新增的那几行。
//
// 前提：settings.yaml 只有 `settings:` 一个顶层键，新键追加在文件末尾即落在它下面。

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SOURCES_DIR = path.resolve('sources');

const newKeys: Record<string, Record<string, string>> = {
  plugins: {
    'zh-CN': '插件',
    'zh-TW': '外掛',
    'en-US': 'Plugins',
    'ja-JP': 'プラグイン',
    'ko-KR': '플러그인',
    'fr-FR': 'Extensions',
    'de-DE': 'Plugins',
    'es-ES': 'Complementos',
    'it-IT': 'Plugin',
    'pt-PT': 'Extensões',
    'ru-RU': 'Плагины',
    'ar-SA': 'الإضافات',
    'hi-IN': 'प्लगइन',
    'vi-VN': 'Plugin',
    'th-TH': 'ปลั๊กอิน',
  },
  pluginDirectory: {
    'zh-CN': '插件目录',
    'zh-TW': '外掛目錄',
    'en-US': 'Plugin Folder',
    'ja-JP': 'プラグインフォルダ',
    'ko-KR': '플러그인 폴더',
    'fr-FR': 'Dossier des extensions',
    'de-DE': 'Plugin-Ordner',
    'es-ES': 'Carpeta de complementos',
    'it-IT': 'Cartella dei plugin',
    'pt-PT': 'Pasta de extensões',
    'ru-RU': 'Папка плагинов',
    'ar-SA': 'مجلد الإضافات',
    'hi-IN': 'प्लगइन फ़ोल्डर',
    'vi-VN': 'Thư mục plugin',
    'th-TH': 'โฟลเดอร์ปลั๊กอิน',
  },
  pluginDirectoryDesc: {
    'zh-CN': '把插件文件夹放进这个目录，重启应用后生效',
    'zh-TW': '把外掛資料夾放進這個目錄，重啟應用後生效',
    'en-US': 'Put plugin folders here; they take effect after restarting the app',
    'ja-JP': 'プラグインフォルダをここに置いてください。アプリを再起動すると有効になります',
    'ko-KR': '플러그인 폴더를 이곳에 넣으세요. 앱을 다시 시작하면 적용됩니다',
    'fr-FR': "Placez les dossiers d'extensions ici ; ils prennent effet après le redémarrage",
    'de-DE': 'Plugin-Ordner hier ablegen; sie werden nach einem Neustart wirksam',
    'es-ES': 'Coloque aquí las carpetas de complementos; surten efecto tras reiniciar',
    'it-IT': 'Metti qui le cartelle dei plugin; hanno effetto dopo il riavvio',
    'pt-PT': 'Coloque aqui as pastas de extensões; têm efeito após reiniciar',
    'ru-RU': 'Поместите папки плагинов сюда; они заработают после перезапуска',
    'ar-SA': 'ضع مجلدات الإضافات هنا، وتصبح فعّالة بعد إعادة تشغيل التطبيق',
    'hi-IN': 'प्लगइन फ़ोल्डर यहाँ रखें; ऐप को पुनः आरंभ करने पर प्रभावी होंगे',
    'vi-VN': 'Đặt thư mục plugin vào đây; có hiệu lực sau khi khởi động lại ứng dụng',
    'th-TH': 'วางโฟลเดอร์ปลั๊กอินไว้ที่นี่ จะมีผลหลังรีสตาร์ทแอป',
  },
  pluginDirectoryUnknown: {
    'zh-CN': '读取中…',
    'zh-TW': '讀取中…',
    'en-US': 'Loading…',
    'ja-JP': '読み込み中…',
    'ko-KR': '불러오는 중…',
    'fr-FR': 'Chargement…',
    'de-DE': 'Wird geladen…',
    'es-ES': 'Cargando…',
    'it-IT': 'Caricamento…',
    'pt-PT': 'A carregar…',
    'ru-RU': 'Загрузка…',
    'ar-SA': 'جارٍ التحميل…',
    'hi-IN': 'लोड हो रहा है…',
    'vi-VN': 'Đang tải…',
    'th-TH': 'กำลังโหลด…',
  },
  pluginNone: {
    'zh-CN': '还没有安装插件',
    'zh-TW': '還沒有安裝外掛',
    'en-US': 'No plugins installed yet',
    'ja-JP': 'プラグインはまだインストールされていません',
    'ko-KR': '아직 설치된 플러그인이 없습니다',
    'fr-FR': 'Aucune extension installée',
    'de-DE': 'Noch keine Plugins installiert',
    'es-ES': 'Aún no hay complementos instalados',
    'it-IT': 'Nessun plugin installato',
    'pt-PT': 'Ainda não há extensões instaladas',
    'ru-RU': 'Плагины ещё не установлены',
    'ar-SA': 'لم تُثبَّت أي إضافات بعد',
    'hi-IN': 'अभी कोई प्लगइन इंस्टॉल नहीं है',
    'vi-VN': 'Chưa cài đặt plugin nào',
    'th-TH': 'ยังไม่ได้ติดตั้งปลั๊กอิน',
  },
  pluginFailed: {
    'zh-CN': '加载失败',
    'zh-TW': '載入失敗',
    'en-US': 'Failed to load',
    'ja-JP': '読み込みに失敗しました',
    'ko-KR': '불러오기 실패',
    'fr-FR': 'Échec du chargement',
    'de-DE': 'Laden fehlgeschlagen',
    'es-ES': 'Error al cargar',
    'it-IT': 'Caricamento non riuscito',
    'pt-PT': 'Falha ao carregar',
    'ru-RU': 'Не удалось загрузить',
    'ar-SA': 'فشل التحميل',
    'hi-IN': 'लोड करने में विफल',
    'vi-VN': 'Tải thất bại',
    'th-TH': 'โหลดไม่สำเร็จ',
  },
  pluginInstall: {
    'zh-CN': '安装插件',
    'zh-TW': '安裝外掛',
    'en-US': 'Install Plugin',
    'ja-JP': 'プラグインをインストール',
    'ko-KR': '플러그인 설치',
    'fr-FR': 'Installer une extension',
    'de-DE': 'Plugin installieren',
    'es-ES': 'Instalar complemento',
    'it-IT': 'Installa plugin',
    'pt-PT': 'Instalar extensão',
    'ru-RU': 'Установить плагин',
    'ar-SA': 'تثبيت إضافة',
    'hi-IN': 'प्लगइन इंस्टॉल करें',
    'vi-VN': 'Cài đặt plugin',
    'th-TH': 'ติดตั้งปลั๊กอิน',
  },
  pluginUninstall: {
    'zh-CN': '卸载',
    'zh-TW': '解除安裝',
    'en-US': 'Uninstall',
    'ja-JP': 'アンインストール',
    'ko-KR': '제거',
    'fr-FR': 'Désinstaller',
    'de-DE': 'Deinstallieren',
    'es-ES': 'Desinstalar',
    'it-IT': 'Disinstalla',
    'pt-PT': 'Desinstalar',
    'ru-RU': 'Удалить',
    'ar-SA': 'إزالة',
    'hi-IN': 'अनइंस्टॉल करें',
    'vi-VN': 'Gỡ cài đặt',
    'th-TH': 'ถอนการติดตั้ง',
  },
  pluginOverwriteTitle: {
    'zh-CN': '插件已存在',
    'zh-TW': '外掛已存在',
    'en-US': 'Plugin Already Installed',
    'ja-JP': 'プラグインは既にインストールされています',
    'ko-KR': '이미 설치된 플러그인입니다',
    'fr-FR': 'Extension déjà installée',
    'de-DE': 'Plugin bereits installiert',
    'es-ES': 'Complemento ya instalado',
    'it-IT': 'Plugin già installato',
    'pt-PT': 'Extensão já instalada',
    'ru-RU': 'Плагин уже установлен',
    'ar-SA': 'الإضافة مثبّتة بالفعل',
    'hi-IN': 'प्लगइन पहले से इंस्टॉल है',
    'vi-VN': 'Plugin đã được cài đặt',
    'th-TH': 'ปลั๊กอินติดตั้งอยู่แล้ว',
  },
  pluginOverwriteDesc: {
    'zh-CN': '已经有同名插件，要覆盖吗？',
    'zh-TW': '已經有同名外掛，要覆蓋嗎？',
    'en-US': 'A plugin with the same id is already installed. Overwrite it?',
    'ja-JP': '同じ ID のプラグインが既にあります。上書きしますか？',
    'ko-KR': '같은 ID의 플러그인이 이미 있습니다. 덮어쓸까요?',
    'fr-FR': 'Une extension avec le même identifiant est déjà installée. Remplacer ?',
    'de-DE': 'Ein Plugin mit derselben ID ist bereits installiert. Überschreiben?',
    'es-ES': 'Ya hay un complemento con el mismo id. ¿Sobrescribir?',
    'it-IT': 'Esiste già un plugin con lo stesso id. Sovrascrivere?',
    'pt-PT': 'Já existe uma extensão com o mesmo id. Substituir?',
    'ru-RU': 'Плагин с таким id уже установлен. Перезаписать?',
    'ar-SA': 'توجد إضافة بالمعرّف نفسه. هل تريد استبدالها؟',
    'hi-IN': 'इसी id का प्लगइन पहले से है। अधिलेखित करें?',
    'vi-VN': 'Đã có plugin cùng id. Ghi đè?',
    'th-TH': 'มีปลั๊กอิน id เดียวกันอยู่แล้ว ต้องการเขียนทับหรือไม่?',
  },
};

const langs = fs
  .readdirSync(SOURCES_DIR)
  .filter((f) => fs.statSync(path.join(SOURCES_DIR, f)).isDirectory());

for (const lang of langs) {
  const settingsPath = path.join(SOURCES_DIR, lang, 'settings.yaml');
  if (!fs.existsSync(settingsPath)) continue;

  const original = fs.readFileSync(settingsPath, 'utf-8');
  const content = yaml.load(original) as Record<string, any>;
  if (!content?.settings) continue;

  const lines: string[] = [];
  for (const [key, translations] of Object.entries(newKeys)) {
    const value = translations[lang];
    if (!value || content.settings[key] !== undefined) continue;
    // 借 js-yaml 生成标量，需要引号时它会自己加
    lines.push(`  ${key}: ${yaml.dump(value).trimEnd()}`);
  }

  if (lines.length === 0) {
    console.log(`Skipped ${lang}/settings.yaml (no missing keys)`);
    continue;
  }

  const separator = original.endsWith('\n') ? '' : '\n';
  fs.writeFileSync(settingsPath, original + separator + lines.join('\n') + '\n');
  console.log(`Updated ${lang}/settings.yaml (+${lines.length})`);
}
