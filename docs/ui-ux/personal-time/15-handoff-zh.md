# UI/UX 交接：个人时间

- 阶段：9 — 交接
- 日期：2026-11-25
- 状态：在用户于 2026-11-25 批准个人时间 UI 包及其呈现差额之后准备。这份交接不授权应用代码、依赖安装，也不修改 PRD 或技术设计。
- 文稿：`docs/ui-ux/personal-time/`。本文件不替换 `docs/ui-ux/14-handoff.md`。
- 计划：已批准的差额已写入 `docs/technical/personal-time/10-implementation-plan.md` 的 PT-023。
- 英文文件是规范文本。译文落后时，以英文文件为准。

## 1. 已批准的内容

| 文件 | 作用 |
|---|---|
| `01-information-architecture.md` | 已接受的结构和路径。 |
| `02-user-flows.md` | 已接受的流程。 |
| `03-screen-inventory.md` | S-01 至 S-09。 |
| `04-wireframes.md` | 已接受的低保真结构。 |
| `05-visual-design.md` | 用已批准令牌画出的 Direction L。 |
| `06-interaction-specifications.md` | I-01 至 I-17。 |
| `09-visual-references.md` | Direction L。 |
| `10-design-tokens.md` 与 `tokens/design-tokens.json` | 已批准的令牌基线。 |
| `11-component-specifications.md` | PT-C01 至 PT-C10。 |
| `12-page-specifications.md` | 页面组合。 |
| `13-visual-validation.md` | 设计文稿检查。对比度不是认证审核。没有运行时截图。 |
| `08-design-review.md` | 发现和处理。UX-PT-REV-001 仍是 GAP-PT-01。 |
| `14-implementation-readiness.md` | 用户批准的就绪检查。 |

## 2. 约束网站的决定

这些决定在另行授权实现之后约束呈现。它们现在不授权那项工作。

- 一条浅色列。内容宽度是 `component.page.content-max`，位于 `component.page.inset` 之内。没有主题开关、导航轨、月网格、搜索、分享、团队或他人的日历。
- 使用个人时间的令牌文件，并映射为普通 CSS 自定义属性。不增加令牌编译器或样式依赖。不复用 `docs/ui-ux/tokens/design-tokens.json`，也不复用桌面组件。
- 页面使用语义令牌或组件令牌。EX-PT-01 是唯一具名的原始值例外：1 像素的区域分隔线。
- 每个命令区域有一个主要按钮。退出是安静的。创建时的 Save 在选中一种重复之前保持安静。不重复选项发送 `none`。
- 命令在途时用次要文字显示 `waiting`，按钮标签保持不变，并且不再次发送。`waiting` 不是 API 结果。
- 留在原页时显示字符串 `ok`，没有第二句成功说明。S-02 和 S-06 在 `ok` 时打开 S-04。S-04 在 `ok` 时打开 S-07。没有会话的受保护路径画出 S-04 和 `logged_out`。
- 开始和结束是键入的公历日和时钟，按输入发送。From 和 To 开始为空。两个都键入之后，Show range 才发送。Q-04 仍然开放，因此没有选定日历第一次打开的范围。
- 删除在 PT-C10 的危险按钮之前不发送。取消不发送。
- 共用失败显示 `result` 字符串，不说明哪个值被占用。
- 任务标题是表面名称。Q-03 仍然开放，因此脚手架文档标题保持不变。Q-02 仍然开放：邮件没有设计，S-02 和 S-06 提交证明码。
- 保持已批准的 API 路由、会话 cookie 和 JSON `result`。不把网站改成 bearer API 客户端。

## 3. 被记录的限制

GAP-PT-01 仍然开放。手输的双起点是 `save_rejected`。只有返回正文已经包含两个时刻时，页面才画出选择。用户已决定，完成 AC-P23 需要技术设计让拒绝正文返回这两个时刻。那项技术设计变更没有做，也不属于这份交接。

## 4. 仍未授权

应用代码、依赖安装、部署，以及对 PRD 或技术设计的修改。PT-023 的实现要等单独、明确的授权。Q-02、Q-03、Q-04、对比度认证和运行时截图仍然开放。
