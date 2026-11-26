# Agenda 令牌提案：个人时间

- 阶段：3 — 设计令牌与核心组件，用户审批 Gate 2
- 日期：2026-11-25
- 状态：用户于 2026-11-25 批准。`tokens/design-tokens.json` 是规范副本。在单独的实现授权之前，`apps/website/app/globals.css` 仍实现先前的基线。
- 来源页面：`previews/gate1-agenda.html`
- 机器可读提案：`tokens/design-tokens.agenda.json`
- Editorial 仍是已批准页面。它不是这些取值的来源。
- 本文件不替换 `10-design-tokens.md`。

## 1. 读到的值

取值来自 Agenda 页面上的规则。横幅背景是提案装饰，不是令牌。正文字重是 400，因为页面没有给正文另设字重。页面上没有失败色、阴影或动效时长，所以这里不新增。工具行和出现行在 640 px 以下改成一列。

| 页面规则 | 提案令牌 |
|---|---|
| 纸色 `#f3f1ec` | `semantic.color.canvas` |
| 墨色 `#1c1917` | `semantic.color.text-primary` |
| 次要字色 `#57534e` | `semantic.color.text-meta` |
| 发丝线 `#e4e0d8` | `semantic.color.border-hairline` |
| 字段 `#fffcf7`，边 `#c8c2b6` | `semantic.color.surface`、`semantic.color.border-field` |
| 强调色 `#9a3412` | `semantic.color.action-primary`、焦点和选中行标记 |
| 选中底 `#f3e6dc` | `semantic.color.selection-wash` |
| 主按钮上的白字 | `semantic.color.text-on-action` |
| 任务标题 22/28，字重 650，字距 `-0.02em` | `component.page.title-*` |
| 出现标题 16/22，字重 650 | `component.row.title-*` |
| 正文 15/22 | `semantic.font.body-*` |
| 安静操作 14 | `component.button.quiet-size` |
| 日期 12/16，字重 650，字距 `0.04em` | `component.day.*` |
| meta 12/18，事实 12/16，显示名 13 | `semantic.font.meta-*`、`semantic.font.facts-line`、`semantic.font.name-size` |
| 控件高 36，圆角 6 | `component.field.height`、`component.button.height` |
| 栏宽 760，事实列 132，选中条 3 | `component.page.content-max`、`component.row.facts-size`、`component.row.selected-mark-width` |

字段水平内边距在页面上是 `10px`。它是 `primitive.space.10`，只给 `component.field.padding-inline` 使用。

## 2. 页面上可见的组件

| 组件 | 页面上的样子 |
|---|---|
| 页面 | 一列。任务标题和安静链接在同一行 |
| 字段 | 标签在上，36 px 高，圆角 6 px，等宽数字 |
| 主按钮 | 实心强调色，白字，字重 600。范围可以显示时使用 |
| 安静操作 | 14 px 墨色文字。悬停时下划线。焦点环 2 px，画在控件外 |
| 日期 | 返回的 `date`，等宽数字，标签下有发丝线 |
| 行 | 事实列。标题和安静操作同一行，meta 在标题下。选中行用浅底和 3 px 强调色条 |
| 选择 | 返回的时刻作为单选项。这一页没有选中时刻，所以 Submit choice 保持安静 |

页面上有的状态是悬停、`focus-visible` 和选中行。禁用、进行中、错误和危险色不在这一页上，本提案不为它们编造颜色。

## 3. 批准

用户于 2026-11-25 批准了这些取值。`tokens/design-tokens.json` 现在保存它们。`apps/website/app/globals.css` 仍实现先前的基线。把 Agenda 用到网站上，需要另一次实现授权。
