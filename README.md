# Textox Translations

Textox 的翻译数据源。社区可自由贡献和改进翻译。

## 仓库结构

- `sources/<lang>/` — 按语言/模块分 YAML 文件（真相源）
- `locales/<lang>.json` — 构建产物（CI 自动生成）

## 贡献

参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 本地使用

```bash
# 构建所有语言
make build

# 构建单个语言
make build-lang LANG=zh-CN
```

### 制作自定义翻译

```bash
# 1. 拷贝一个语言作为模板
cp -r sources/zh-CN sources/my-custom

# 2. 编辑 meta.yaml（改名字）
vim sources/my-custom/meta.yaml

# 3. 修改翻译值
vim sources/my-custom/editor.yaml

# 4. 构建
make build-lang LANG=my-custom

# 5. 导入 locales/my-custom.json 到 Textox
```

## 许可

MIT
