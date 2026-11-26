# 视觉校验：个人时间

- 阶段：6 — 设计系统与视觉校验
- 日期：2026-11-25
- 状态：用户接受绘制之后，由主设计会话记录的 Agenda 设计文稿检查。这份记录替换本文件里较早的 Direction L 各行。这不是独立评审，也不是运行时截图检查。它不授权应用代码。
- 检查的文稿：`previews/gate1-agenda.html`、`tokens/design-tokens.json`、`05-visual-design.md`、`06-interaction-specifications.md`、`11-component-specifications.md`、`04-wireframes.md`、`12-page-specifications.md`。
- 来源页面：已批准的 Agenda 页面。Editorial 是已批准的页面，不是这次对照的来源。
- 英文文件是规范文本。
- 本文件不替换 `docs/ui-ux/13-visual-validation.md`。

## 证据

| 检查 | 预期 | 观察到的情况 | 状态 |
|---|---|---|---|
| 令牌文件 | 已批准的 Agenda 基线。别名能够解析。 | `meta.status` 是 APPROVED，`visualDirection` 是 `agenda`，`tokenBaselineApproved` 是 true。Stage 7 为已经存着的 `primitive.font.line-facts`（事实行高 16 像素）增加 `semantic.font.facts-line` 和 `component.row.facts-line` 之后，本地遍历解析了 155 个令牌。没有缺失，也没有循环。底色解析为 `#f3f1ec`。强调色解析为 `#9a3412`。 | PASS |
| Gate 1 页面 | 绘制使用该页的列、页眉、工具行、日标签、事实词、选中行和堆叠。 | 该页是 `#f3f1ec` 上一条 760 像素的列，标题 22/28、字重 650，安静链接在同一行，工具网格是 `1fr 1fr auto`，日标签来自返回的日期，事实列 132 像素且使用词，选中浅底 `#f3e6dc` 和 3 像素强调条，640 像素处堆叠。`05-visual-design.md` 引用的令牌解析为这些值。横幅 `#efeae2` 不进入令牌基线，也不进入绘制。 | PASS |
| 令牌引用 | 页面和组件合同引用的令牌都存在。 | 经过下面的对齐之后，`05-visual-design.md` 引用 56 个令牌，`11-component-specifications.md` 引用 25 个，线框、页面和交互文件只引用存在的令牌。 | PASS |
| 原始值 | 页面使用语义令牌或组件令牌。已具名的例外保持具名。 | EX-PT-01 把 `component.field.border-width` 和 `semantic.color.border-hairline` 配在一起。EX-PT-02 在事实列使用词。`04-wireframes.md` 和 `12-page-specifications.md` 也写了 “640 px”，这是 `component.page.stack-below` 的解析值。没有引入新的颜色、字号或圆角。 | PASS |
| 组件复用 | S-01 至 S-09 使用 PT-C01 至 PT-C10。 | 绘制和对齐后的组件合同使用这些标识。PT-C10 留在列内。Delete 使用主要外观。Cancel 保持安静。 | PASS |
| 主要动作 | 每个命令区域一个已就绪的主要按钮。 | S-01 至 S-06 各有一个区域。S-07 在两个日期都存在之前让 Show range 保持安静，在选中一个返回时刻之前让 Submit choice 保持安静。S-09 的昵称和时区各有一个主要按钮。退出保持安静。 | PASS |
| 状态 | 就绪、空、在途、拒绝、成功、取消、已登出、破坏性确认、跳过、生成的选择、月预览、冲突、继续句。 | `05-visual-design.md` 第 3 至第 6 节，以及 I-01 至 I-17。在途时按钮标签不变，没有旋转指示。`waiting` 使用 `semantic.color.text-meta`。成功不增加吐司。失败使用 `semantic.color.text-primary`，并且不改变字段边框。 | PASS，另见下面的 GAP-PT-01 |
| 准则覆盖 | AC-P01 至 AC-P40 各有一个交互或一条已记录的缺口。AC-L01 至 AC-L13 没有表面。 | 除 AC-P14、AC-P23 和 AC-P36 外，每个 AC-P 标识都出现在一个交互上。AC-P23 是 GAP-PT-01。AC-P14 和 AC-P36 打印返回的时刻，不显示单独的时钟标签。AC-L01 至 AC-L13 没有目的地。 | PASS，另见这三处缺口 |
| 状态用词 | 可见性和状态保持为词。 | Agenda 页面和 `05-visual-design.md` 第 4 节把 `private`、`public`、`scheduled`、`skipped` 和 `choice_required` 显示为词。没有编造星期。 | PASS |
| 动效 | 反馈是 0 毫秒。 | `semantic.motion.feedback` 解析为 `0ms`。没有规定入场动效。 | PASS |
| 窗口 | 一条 760 像素的列。低于 640 像素时，S-07 的工具行和出现行改成一列。 | 引用了 `component.page.content-max` 和 `component.page.stack-below`。页面不增加导航轨或月网格。 | PASS |
| 破坏性确认 | 删除留在 S-08 或 S-09，PT-C10 里的主要 Delete 之前不发送。 | I-12 和 I-16。第一个控件展示 PT-C10。没有增加对话框。 | PASS |
| 范围 | 没有搜索、分享、团队、他人的日历、主题开关、邮件版式或初始范围。 | Stage 5 的页面里没有这些项。Q-02、Q-03 和 Q-04 仍开放。文档标题仍是脚手架标题。 | PASS |
| 初次打开与样例 | 来源页可以展示一条已填好的样例范围。产品页的 From 和 To 开始是空的。 | `gate1-agenda.html` 填入 From `2026-06-01` 和 To `2026-06-30`，以便样例行可见。`04-wireframes.md` 让初次打开保持空白，因为 Q-04 仍开放。样例上的 Show range 是主要按钮，因为两个日期都在。 | PASS |
| 对比度认证 | 设计时的颜色配对不是认证审核。 | 没有对渲染结果测量。 | NOT RUN |
| 运行时截图 | 等到编码被授权。 | `apps/website/app/globals.css` 仍实现先前的基线。这次检查没有改写或运行应用代码。 | NOT RUN |
| 这次绘制的独立评审 | 设计评审关口由单独的只读评审者进行。 | Agenda 绘制尚未评审。`08-design-review.md` 里较早的评审检查的是 Direction L 文稿。 | NOT RUN |

## 本次检查中做的对齐

`11-component-specifications.md` 仍描述 Direction L 合同。它引用了 `component.page.inset`、`component.mark.size`、`component.mark.text`、`component.row.min-height`、`component.result.duration` 和 `component.confirm`。这些令牌不在 Agenda 基线里。它还规定了几何标记、2 像素选中条、危险 Delete 外观和失败色文字。

已接受的绘制已经定下这些点：事实是词，选中条是 `component.row.selected-mark-width`（3 像素），确认删除使用主要外观，失败是 `semantic.color.text-primary` 中的 `result` 词。本阶段把英文组件合同和中文译本对齐到那份绘制，并更新 I-16：账户删除只由 PT-C10 里的主要 Delete 按钮发送。命令、路由和确认步骤没有改变。第二次引用遍历没有发现缺失的令牌。

## 记录的例外

- EX-PT-01，发丝线的宽度 `component.field.border-width` 配颜色 `semantic.color.border-hairline`，是发丝线的令牌层例外。
- EX-PT-02，S-07 的状态是事实列里的词，取代 Direction L 的几何标记。
- 在 Description 里按 Enter 插入换行，不激活 Save。在单行字段里按 Enter 仍激活该区域的主要按钮。这一点记在 `06-interaction-specifications.md`。

## GAP-PT-01

发生两次的当地时间在保存带上一个选定时刻之前是 `save_rejected`。已批准的错误正文为月日期拒绝记录了 `monthTypes` 和 `missingDates`。它没有记录这次双起点拒绝里的两个时刻。页面不得自行计算这些时刻。

因此 `05-visual-design.md` 只有在返回正文已经包含这些时刻时才画 PT-C06。生成的 `choice_required` 行确实包含两个时刻，I-08 可以提交其中一个。手输的双起点目前没有这样的正文，所以页面可以显示 `save_rejected`，但不能提供选择。

AC-P15 由这次拒绝覆盖。AC-P23，即选中两个手输时刻中的一个，按当前页面合同无法完成。用户于 2026-11-25 决定：要完成 AC-P23，需要技术设计改成返回这两个时刻。本次检查不做这个改动。

## 计划对齐

实施计划没有修改。网站样式表没有修改。把 Agenda 绘制用到网站上，要等以后另行授权实现。较早的 Stage 8 批准和 Stage 9 交接仍是 Direction L 文稿的记录。

## 未决项

- Q-02：邮件没有设计。S-02 和 S-06 提交证明码。
- Q-03：没有画出产品标题。文档标题仍是脚手架标题。
- Q-04：From 和 To 开始是空的。两个都键入之前，Show range 不发送。
- GAP-PT-01：手输的双起点没有可绘制的返回时刻。
- Agenda 绘制的 Stage 7 评审记在 `08-design-review.md`。对处理结果的复审没有剩余发现。
