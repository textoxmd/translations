# 贡献指南

## 修改已有翻译

直接编辑 `sources/<lang>/<module>.yaml` 中的值，提交 PR 即可。

## 新增语言

```bash
make init-lang LANG=nb-NO
```

这会从 en-US 复制模板到 `sources/nb-NO/`。翻译所有 YAML 文件后提交 PR。

## CI 检查

- YAML 格式正确性
- 模块文件完整性（与 en-US 对比）
- 翻译 key 完整性（与 en-US 对比）

缺失的 key 不阻塞合并，运行时自动回落到 en-US。

## 准则

- 翻译应准确、自然、符合目标语言习惯
- 不要修改或删除已有 key
- 占位符（%s, %d, {name} 等）必须保留
