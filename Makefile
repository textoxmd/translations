.PHONY: build build-lang init-lang validate validate-lang missing custom

build:
	bun run build

build-lang:
	@if [ -z "$(LANG)" ]; then echo "Usage: make build-lang LANG=nb-NO"; exit 1; fi
	@mkdir -p locales
	@bun -e "
	const fs = require('fs');
	const path = require('path');
	const yaml = require('js-yaml');
	const dir = path.join('sources', '$(LANG)');
	const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') && f !== 'meta.yaml').sort();
	const bundle = {};
	for (const f of files) {
		const ns = f.replace('.yaml', '');
		const c = yaml.load(fs.readFileSync(path.join(dir, f), 'utf-8'));
		bundle[ns] = c[ns];
	}
	const meta = yaml.load(fs.readFileSync(path.join(dir, 'meta.yaml'), 'utf-8')) || {};
	const wrapped = { version: 1, lang: '$(LANG)', name: meta.name || '$(LANG)', nativeName: meta.nativeName || meta.name || '$(LANG)', rtl: meta.rtl || false, translations: bundle };
	fs.writeFileSync(path.join('locales', '$(LANG).json'), JSON.stringify(wrapped, null, 2));
	console.log('Built locales/$(LANG).json');
	"

init-lang:
	@if [ -z "$(LANG)" ]; then echo "Usage: make init-lang LANG=nb-NO"; exit 1; fi
	@if [ -d "sources/$(LANG)" ]; then echo "Language $(LANG) already exists"; exit 1; fi
	@cp -r sources/en-US sources/$(LANG)
	@echo "Created sources/$(LANG)/ from en-US template"
	@echo "Translate the YAML files and submit a PR"

validate:
	bun run validate

validate-lang:
	@if [ -z "$(LANG)" ]; then echo "Usage: make validate-lang LANG=nb-NO"; exit 1; fi
	@bun -e "
	const fs = require('fs');
	const path = require('path');
	const yaml = require('js-yaml');
	const dir = path.join('sources', '$(LANG)');
	const enDir = path.join('sources', 'en-US');
	const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.yaml')).sort();
	const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml')).sort();
	let err = false;
	for (const f of enFiles) {
		if (!files.includes(f)) { console.error('Missing:', f); err = true; }
	}
	process.exit(err ? 1 : 0);
	"

missing:
	@if [ -z "$(LANG)" ]; then echo "Usage: make missing LANG=nb-NO"; exit 1; fi
	@bun -e "
	const fs = require('fs');
	const path = require('path');
	const yaml = require('js-yaml');
	const enDir = path.join('sources', 'en-US');
	const langDir = path.join('sources', '$(LANG)');
	const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.yaml'));
	for (const f of enFiles.sort()) {
		const en = yaml.load(fs.readFileSync(path.join(enDir, f), 'utf-8'));
		const ns = f.replace('.yaml', '');
		const enKeys = Object.keys(en[ns]);
		let langKeys = [];
		try {
			const l = yaml.load(fs.readFileSync(path.join(langDir, f), 'utf-8'));
			langKeys = Object.keys(l[ns]);
		} catch {}
		const missing = enKeys.filter(k => !langKeys.includes(k));
		if (missing.length) console.log(f + ': missing ' + missing.join(', '));
	}
	"

custom:
	@if [ -z "$(LANG)" ] || [ -z "$(FILE)" ]; then echo "Usage: make custom LANG=zh-CN FILE=my.yaml"; exit 1; fi
	@mkdir -p locales
	@bun -e "
	const fs = require('fs');
	const path = require('path');
	const yaml = require('js-yaml');
	const dir = path.join('sources', '$(LANG)');
	let bundle = {};
	if (fs.existsSync(dir)) {
		const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') && f !== 'meta.yaml').sort();
		for (const f of files) {
			const ns = f.replace('.yaml', '');
			const c = yaml.load(fs.readFileSync(path.join(dir, f), 'utf-8'));
			bundle[ns] = c[ns];
		}
	}
	const custom = yaml.load(fs.readFileSync('$(FILE)', 'utf-8'));
	for (const [ns, keys] of Object.entries(custom)) {
		bundle[ns] = { ...(bundle[ns] || {}), ...keys };
	}
	const out = 'custom-$(LANG).json';
	const wrapped = {
		version: 1,
		lang: '$(LANG)',
		name: process.env.NAME || '',
		source: '$(FILE)',
		imported_at: new Date().toISOString(),
		translations: bundle,
	};
	fs.writeFileSync(out, JSON.stringify(wrapped, null, 2));
	console.log('Wrote', out);
	"

