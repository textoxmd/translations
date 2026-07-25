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

# 为自定义翻译合并覆写
make custom LANG=zh-CN FILE=my-overrides.yaml

# 构建自定义翻译（NAME 显示在语言选择器中）
NAME='我的中文翻译' make custom LANG=zh-CN FILE=my-overrides.yaml
```

## 许可

MIT
