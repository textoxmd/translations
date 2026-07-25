.PHONY: build build-lang init-lang validate validate-lang missing

build:
	bun run build

build-lang:
	@if [ -z "$(LANG)" ]; then echo "Usage: make build-lang LANG=nb-NO"; exit 1; fi
	@bun run scripts/build.ts --lang $(LANG)

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



