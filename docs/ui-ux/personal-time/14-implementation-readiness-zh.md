# 实现就绪：个人时间

- 阶段：8 — 实现就绪与用户批准
- 日期：2026-11-25
- 状态：用户于 2026-11-25 批准。这次批准接受 Agenda 文稿，并把第 3 节的呈现差额写入 PT-023。它不授权修改 `apps/website`。同一天稍后，用户授权应用这份交接。该应用记录在 `15-handoff.md`。
- 较早的批准：用户于 2026-11-25 批准了 Direction L 文稿及其呈现差额。上面的 Agenda 批准已在 PT-023 中替换该呈现来源。
- 文稿：`docs/ui-ux/personal-time/` 中已接受的 Agenda 结构、令牌、线框、页面说明、绘制、交互、Stage 6 校验和 Stage 7 评审。
- 英文文件是规范文本。本文件不替换 `docs/ui-ux/14-handoff.md`。

## 1. 检查

| 检查 | 结果 |
|---|---|
| AC-P01 至 AC-P40 | 每个标识都在一条流程上。AC-P14、AC-P23 和 AC-P36 是已记录的缺口。其余标识在一个交互上。页面显示返回正文，不重新计算展开、重叠、时钟标签或证明结果。 |
| AC-P23 | GAP-PT-01。页面显示 `save_rejected`，并且只有正文已经包含两个时刻时才画出选择。完成该选择需要技术设计变更。该变更没有做。 |
| AC-P14 和 AC-P36 | S-07 打印返回的 `start` 和 `end`。日历正文没有单独的时钟标签字段。时区时钟标签需要技术设计变更。该变更没有做。 |
| AC-L01 至 AC-L13 | 没有目的地。 |
| 技术合同 | 页面发送已批准的 API 路由，使用会话 cookie，并读取 JSON `result`。它不使用 bearer API 客户端。 |
| 令牌和组件 | `tokens/design-tokens.json` 是 APPROVED，`visualDirection` 是 `agenda`，155 个别名能够解析。页面引用语义令牌或组件令牌。EX-PT-01 是发丝线宽度。EX-PT-02 是事实列里的状态词。组件是 PT-C01 至 PT-C10。 |
| 状态 | 就绪、`waiting`、`semantic.color.text-primary` 中的共用失败、留在原页的 `ok`、验证和完成找回后的跳转、带 `logged_out` 的受保护 S-04、空范围、跳过、生成的选择、S-07 出现上的焦点浅底、冲突、继续句、月预览，以及页面内的删除确认，都已写明。 |
| 发现 | UX-PT-AGENDA-001 至 UX-PT-AGENDA-010 已处理。后续复审没有剩余发现。Direction L 的发现仍是历史。 |
| 无障碍 | DEC-079 没有规定无障碍标准。标签、焦点环、视觉 Tab 顺序和状态词已写明。对比度没有测量。 |
| 运行时截图 | 稍后的授权之后，已于 2026-11-25 检查。注册、登录、事件、日历和账户使用 Agenda 的单列、页眉链接和强调色。失败仍是主文字色里的 `result` 词。对比度没有测量。 |

## 2. 这次批准会接受的呈现

- 一条浅色列，宽度是 `component.page.content-max`，内边距用 Agenda 页面的内边距。低于 `component.page.stack-below` 时，S-07 的工具行和出现行改成一列。标题和安静操作仍在同一行。没有主题开关、导航轨、月网格、搜索、分享、团队或他人的日历。
- 页眉上的安静链接在 Tab 顺序里最先。焦点从该顺序的第一个控件开始。
- 任务标题是表面名称。Q-03 仍开放，因此脚手架文档标题保持不变。
- Q-04 仍开放。From 和 To 开始是空的。两个日期都键入之前，Show range 保持安静。
- Q-02 仍开放。邮件没有设计。S-02 和 S-06 提交证明码。
- 命令在途时以 `semantic.color.text-meta` 显示 `waiting`，按钮标签保持不变，并且不再次发送。
- 留在原页时显示字符串 `ok`，没有第二句成功说明。S-02 和 S-06 在 `ok` 时打开 S-04。S-04 在 `ok` 时打开 S-07。没有会话的受保护路径画出 S-04 和 `logged_out`。
- 创建时的 Save 在选中一种重复之前是安静的。不重复选项发送 `none`。
- 开始和结束是键入的公历日和时钟，按输入发送。
- 删除在 PT-C10 里的主要 Delete 按钮之前不发送。取消不发送。没有危险色。
- 共用失败以 `semantic.color.text-primary` 显示 `result` 字符串。字段边框不变。
- S-07 打印返回的 `start` 和 `end` 字符串。它不另排时钟标签，也不编造星期。

## 3. 已应用的计划差额

用户批准本文件之后，已于 2026-11-25 写入 `docs/technical/personal-time/10-implementation-plan.md` 的 PT-023。呈现来源是 `15-handoff.md` 交接的 Agenda 文稿。

- 呈现遵循 `05-visual-design.md`、`06-interaction-specifications.md`、`11-component-specifications.md`、`04-wireframes.md`、`12-page-specifications.md`，以及 `visualDirection` 为 `agenda` 的 `tokens/design-tokens.json`。
- 把这些 Agenda 令牌映射为普通 CSS 自定义属性。不增加令牌编译器或样式依赖。不复用 `docs/ui-ux/tokens/design-tokens.json`。
- 保持已批准的 API 路由、会话 cookie 和 JSON `result`。不把网站改成 bearer API 客户端。
- 确认删除使用 PT-C10 里的主要按钮外观。
- 不为手输的双起点发明两个时刻。显示 `save_rejected`，并且只从正文已有的时刻画出选择。
- S-07 打印返回的 `start` 和 `end`。在技术设计返回单独的时区时钟标签之前，不另排这个标签。
- 在 Q-02、Q-03 和 Q-04 开放期间，不选定产品标题、邮件版式或日历第一次打开的范围。

这次批准不授权修改 `apps/website`。交接是 `15-handoff.md`。

## 4. 先前已应用的 Direction L 差额

已于 2026-11-25、Agenda 批准之前写入 PT-023。它要求网站表单遵循当时记在 `15-handoff.md` 里的 Direction L 文稿。Agenda 批准替换了该呈现来源。稍后的授权之后，`apps/website/app/globals.css` 与 Agenda 令牌一致。
