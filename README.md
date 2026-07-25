# Textox Translations

Textox Markdown 编辑器的翻译数据源。社区自由贡献和改进翻译。

## 快速开始

```bash
git clone https://github.com/textox/translations
cd translations
bun install       # 安装依赖
make build         # 构建所有语言，输出到 locales/
```

构建产物 `locales/<lang>.json` 可直接导入 Textox（`文件 > 导入翻译...`）。

## 仓库结构

```
sources/
  zh-CN/
    meta.toml       # 语言元数据：lang、name、nativeName、rtl
    common.yaml     # 通用 UI 文本
    editor.yaml     # 编辑器标签
    menu.yaml       # 菜单项
    settings.yaml   # 设置面板
    ...             # 共 20 个模块
  en-US/
    meta.toml
    common.yaml
    ...
  ja-JP/
  ...
locales/            # 构建产物，不手动编辑
  zh-CN.json
  en-US.json
  ...
```

## 修改已有翻译

编辑对应语言的 YAML 文件，提交 PR：

```bash
# 修改中文的菜单翻译
vim sources/zh-CN/menu.yaml
make build-lang LANG=zh-CN
# 验证 locales/zh-CN.json
```

## 新增语言

```bash
make init-lang LANG=nb-NO
# 创建 sources/nb-NO/，模板来自 en-US
# 翻译所有 YAML 文件
make build-lang LANG=nb-NO
# 提交 PR
```

## 制作个人自定义翻译

适合做个性化翻译包，不提交到仓库：

```bash
# 1. 拷贝一个语言作为模板
cp -r sources/zh-CN sources/my-custom

# 2. 编辑元数据（lang 必须唯一）
vim sources/my-custom/meta.toml

# 3. 修改翻译值
vim sources/my-custom/editor.yaml

# 4. 构建
make build-lang LANG=my-custom

# 5. 导入 locales/my-custom.json 到 Textox
#    菜单 → 文件 → 导入翻译...
```

`meta.toml` 示例：

```toml
lang = "my-custom"
name = "我的翻译"
nativeName = "我的翻译"
rtl = false
```

## 语言选择器显示规则

导入后，语言选择器按以下方式显示：

- 内置语言（如 zh-CN）→ `简体中文`
- 内置语言 + 自定义翻译 → `简体中文 [已导入]`
- 纯自定义语言 → `my-custom: 我的翻译 [已导入]`

## 许可

MIT
