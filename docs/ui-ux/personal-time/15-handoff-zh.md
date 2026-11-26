# UI/UX 交接：个人时间

- 阶段：9 — 交接
- 日期：2026-11-25
- 状态：用户于 2026-11-25 授权把这份 Agenda 交接用到 `apps/website`。该授权覆盖本文件里的呈现。它不授权部署、生产主机、邮件服务商，也不修改 PRD 或技术设计。
- 文稿：`docs/ui-ux/personal-time/`。本文件替换同日较早准备的 Direction L 交接。它不替换 `docs/ui-ux/14-handoff.md`。
- 计划：已批准的 Agenda 差额已写入 `docs/technical/personal-time/10-implementation-plan.md` 的 PT-023。
- 英文文件是规范文本。译文落后时，以英文文件为准。

## 1. 已批准的内容

| 文件 | 作用 |
|---|---|
| `01-information-architecture.md` | 已接受的结构和路径。 |
| `02-user-flows.md` | 已接受的流程。AC-P14、AC-P23 和 AC-P36 是已记录的缺口。 |
| `03-screen-inventory.md` | S-01 至 S-09。 |
| `04-wireframes.md` | 已接受的 Agenda 低保真结构。 |
| `05-visual-design.md` | 已接受的 Agenda 绘制。 |
| `06-interaction-specifications.md` | I-01 至 I-17。 |
| `09-visual-references.md` | Agenda 是已接受的方向。Direction L 仍是历史。 |
| `10-design-tokens-agenda.md` 与 `tokens/design-tokens.json` | 已批准的 Agenda 令牌基线，`visualDirection` 为 `agenda`。 |
| `11-component-specifications.md` | PT-C01 至 PT-C10，已对齐到 Agenda 绘制。 |
| `12-page-specifications.md` | 页面组合。 |
| `13-visual-validation.md` | Agenda 设计文稿检查。对比度没有测量。没有运行时截图。 |
| `08-design-review.md` | UX-PT-AGENDA-001 至 UX-PT-AGENDA-010 已处理。Direction L 评审仍是历史。 |
| `previews/gate1-agenda.html` | 已批准的视觉依据页面。 |
| `14-implementation-readiness.md` | 用户批准的就绪检查。 |

## 2. 约束网站的决定

这些决定在另行授权实现之后约束呈现。它们现在不授权那项工作。

- 一条浅色列。内容宽度是 `component.page.content-max`，内边距用 Agenda 页面的内边距。低于 `component.page.stack-below` 时，S-07 的工具行和出现行改成一列。标题和安静操作仍在同一行。没有主题开关、导航轨、月网格、搜索、分享、团队或他人的日历。
- 页眉上的安静链接在 Tab 顺序里最先。
- 使用 Agenda 令牌文件，并映射为普通 CSS 自定义属性。不增加令牌编译器或样式依赖。不复用 `docs/ui-ux/tokens/design-tokens.json`，也不复用桌面组件。
- 页面使用语义令牌或组件令牌。EX-PT-01 是发丝线宽度。EX-PT-02 是事实列里的状态词。
- 每个命令区域有一个已就绪的主要按钮。退出是安静的。创建时的 Save 在选中一种重复之前保持安静。不重复选项发送 `none`。两个日期都键入之前，Show range 保持安静。选中一个返回时刻之前，Submit choice 保持安静。
- 命令在途时以 `semantic.color.text-meta` 显示 `waiting`，按钮标签保持不变，并且不再次发送。
- 留在原页时显示字符串 `ok`，没有第二句成功说明。S-02 和 S-06 在 `ok` 时打开 S-04。S-04 在 `ok` 时打开 S-07。没有会话的受保护路径画出 S-04 和 `logged_out`。
- 在 Description 里按 Enter 插入换行，不激活 Save。在单行字段里按 Enter 激活该区域的主要按钮。
- S-07 的浅底和强调条跟着该出现内部的焦点。它们不选中时刻，也不改变 Save 或 Delete。
- 开始和结束是键入的公历日和时钟，按输入发送。From 和 To 开始为空。S-07 打印返回的 `start` 和 `end`，不编造星期。
- 删除在 PT-C10 里的主要 Delete 按钮之前不发送。取消不发送。没有危险色。
- 共用失败以 `semantic.color.text-primary` 显示 `result` 字符串。字段边框不变。
- 任务标题是表面名称。Q-03 仍然开放，因此脚手架文档标题保持不变。Q-02 仍然开放：邮件没有设计。Q-04 仍然开放：没有选定日历第一次打开的范围。
- 保持已批准的 API 路由、会话 cookie 和 JSON `result`。不把网站改成 bearer API 客户端。

## 3. 被记录的限制

- GAP-PT-01 仍然开放。手输的双起点是 `save_rejected`。只有返回正文已经包含两个时刻时，页面才画出选择。完成 AC-P23 需要技术设计变更。该变更没有做。
- AC-P14 和 AC-P36 仍然开放。与返回的 `start` 和 `end` 不同的时区时钟标签需要技术设计变更。该变更没有做。

## 4. 仍未授权

部署、生产主机、邮件服务商、现有网站之外的依赖安装，以及对 PRD 或技术设计的修改。对比度测量仍然开放。
