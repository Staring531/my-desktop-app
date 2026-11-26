# Gate 1 提案：个人时间网站

- 状态：用户于 2026-11-25 批准了两张可打开页面，指定 Agenda 为网站令牌来源，并在同日批准了 Agenda 令牌基线。Editorial 仍是已批准页面，不是令牌来源。`tokens/design-tokens.json` 保存已批准的 Agenda 取值。网站样式表仍实现先前的基线。
- 阶段：`docs/process/UI_UX_DESIGN.md` 2.1.0 的 Stage 2，用户审批 Gate 1。
- 主屏幕：S-07 Own Calendar。两页都是一段范围已经返回之后的示例。它们不决定最初的 `from` 和 `to`。Q-04 仍开着。
- 返回字段保持原样：`visibility`、`state`、`title`、`displayName`、`date`、`location`、`description`、`start`、`end`，以及 `choice_required` 的两个 `instants`。页面不另算时刻，也不编造星期。
- 这两页上的颜色是临时的，不是令牌。
- 本提案不包含应用代码。

## 1. Agenda

| 字段 | 记录 |
|---|---|
| 文件 | `docs/ui-ux/personal-time/previews/gate1-agenda.html` |
| 参考族 | 个人日程列表 |
| 来源 | Fantastical 公开产品站 `https://flexibits.com/fantastical` |
| 采用 | 每次出现一行。标题和安静操作同一行。返回的开始和结束在 meta 行。日期标签使用返回的 `date`。一个强调色只给选中行和已就绪的主按钮。 |
| 排除 | Flexibits 的名称、标志、图标、自然语言输入、月历和品牌色。 |
| 姿态 | 一份工作列表。范围表单是列表上方的工具行。 |
| 字体 | 一种系统无衬线。标题、正文、meta 三个字号。 |
| 颜色 | 暖纸色、深色字、一个赤陶强调色。可见性和状态保留原文。 |
| 动效 | 无。 |

## 2. Editorial

| 字段 | 记录 |
|---|---|
| 文件 | `docs/ui-ux/personal-time/previews/gate1-editorial.html` |
| 参考族 | 文化活动列表 |
| 来源 | Serpentine Galleries 公开活动索引 `https://www.serpentinegalleries.org/whats-on/` |
| 采用 | 出现的标题是该行最大的文字。事实共用一条 meta。区域靠空白和发丝线分开。主操作是带下划线的文字。 |
| 排除 | Serpentine 的名称、标志、摄影、票务和展览营销。 |
| 姿态 | 一份目录。任务标题占主导。操作挨着它作用的文字。 |
| 字体 | 任务标题和出现标题用衬线。字段、meta 和操作用无衬线。 |
| 颜色 | 暖纸色和墨色。没有实心强调色。选中是一条重线。 |
| 动效 | 无。 |

## 3. 决定

用户于 2026-11-25 批准了两页。同日，用户指定 Agenda 为网站令牌来源。Editorial 仍是已批准页面，不是令牌来源。用户于 2026-11-25 批准了 Agenda 提取。`tokens/design-tokens.json` 是该基线。网站样式表仍实现先前的基线。
