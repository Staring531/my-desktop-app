# 视觉校验：个人时间

- 阶段：6 — 设计系统与视觉校验
- 日期：2026-11-25
- 状态：由主设计会话记录的设计文稿检查。这不是独立评审，也不是运行时截图检查。
- 检查的文稿：`tokens/design-tokens.json`、`05-visual-design.md`、`06-interaction-specifications.md`、`04-wireframes.md`、`12-page-specifications.md`、`11-component-specifications.md`、`10-design-tokens.md`、`03-screen-inventory.md`、`02-user-flows.md`。
- 用户于 2026-11-25 接受了 Stage 4。Stage 5 处于 READY FOR USER REVIEW，本次检查的是这套文稿。这些检查不接受 Stage 5，也不授权应用代码。
- 英文文件是规范文本。
- 本文件不替换 `docs/ui-ux/13-visual-validation.md`。
- 本阶段没有做独立的 UI/UX 评审。

## 证据

| 检查 | 预期 | 观察到的情况 | 状态 |
|---|---|---|---|
| 令牌文件 | 已批准的浅色主题。语义别名和组件别名能够解析。 | `meta.status` 是 APPROVED，`tokenBaselineApproved` 是 true。本地遍历解析了 69 个语义别名和组件别名。没有缺失，也没有循环。 | PASS |
| 页面上的原始值 | 页面使用语义令牌或组件令牌，例外要具名。 | `05-visual-design.md` 只点名 EX-PT-01：`primitive.size.rule` 配 `semantic.color.border-hairline`，因为没有语义边框宽度。页面没有引入其他原始颜色、字号或圆角。 | PASS |
| 组件复用 | S-01 至 S-09 使用 PT-C01 至 PT-C10。没有新组件。 | `05-visual-design.md` 用这些组件画每个表面。确认步骤是列内的 PT-C10。 | PASS |
| 主要动作 | 每个命令区域一个主要按钮。 | S-01 至 S-06 各有一个区域。S-07 在两个日期都存在之前让 Show range 保持安静，在选中一个返回时刻之前让 Submit choice 保持安静。S-09 的昵称和时区各有一个主要按钮。退出保持安静。 | PASS |
| 状态 | 就绪、空、在途、拒绝、成功、取消、已登出、破坏性确认、跳过、生成的选择、月预览、冲突、继续句。 | `05-visual-design.md` 第 3 至第 6 节，以及 I-01 至 I-17。在途时按钮标签不变，没有旋转指示。成功不增加吐司。 | PASS，另见下面的 GAP-PT-01 |
| 准则覆盖 | AC-P01 至 AC-P40 各有一个交互或一个有理由的页面限制。AC-L01 至 AC-L13 没有表面。 | 每个 AC-P 标识都出现在 `06-interaction-specifications.md` 的某个交互上。页面显示返回正文，不重新计算展开、重叠或时钟标签。AC-L01 至 AC-L13 没有目的地。 | PASS，手输双起点的选择除外，见 GAP-PT-01 |
| 不单靠颜色的状态 | 公开、私密、scheduled、skipped 和 choice required 是标记加上 API 用词。 | `05-visual-design.md` 第 4 节。强调色只用于已就绪的主要按钮、焦点环和选中行的标记。共用失败不把某一个字段边框改色。 | PASS |
| 动效 | 减少动效与规定的动效相同。 | `component.result.duration` 是 0 毫秒。没有规定入场动效。 | PASS |
| 任务列 | 一条 640 像素的任务列。更窄的视口保持堆叠并滚动。 | 引用了 `component.page.content-max` 和 `component.page.inset`。没有增加断点或第二列。 | PASS |
| 破坏性确认 | 删除留在 S-08 或 S-09，危险按钮之前不发送。 | I-12 和 I-16。第一个控件展示 PT-C10。没有增加对话框。 | PASS |
| 范围 | 没有搜索、分享、团队、他人的日历、主题开关、邮件版式或初始范围。 | Stage 5 的页面里没有这些项。Q-02、Q-03 和 Q-04 仍开放。 | PASS |
| 对比度认证 | 设计时的比值不是认证审核。 | `10-design-tokens.md` 里的比值仍是设计时算术。没有对渲染结果测量。 | NOT CHECKED |
| 运行时截图 | 等到编码被授权。 | 没有运行应用代码。 | NOT CHECKED |
| 独立评审 | 设计评审关口由单独的只读评审者进行。 | 已于 2026-11-25 进行。发现在 `08-design-review.md`。 | RECORDED |

## 记录的例外

- EX-PT-01，1 像素的区域线，是页面上唯一的令牌层例外。
- 在 Description 里按 Enter 插入换行，不激活 Save。在单行字段里按 Enter 仍激活该区域的主要按钮。这一点记在 `06-interaction-specifications.md`，以便多行说明可以包含换行。

## GAP-PT-01

发生两次的当地时间在保存带上一个选定时刻之前是 `save_rejected`。已批准的错误正文为月日期拒绝记录了 `monthTypes` 和 `missingDates`。它没有记录这次双起点拒绝里的两个时刻。页面不得自行计算这些时刻。

因此 `05-visual-design.md` 只有在返回正文已经包含这些时刻时才画 PT-C06。生成的 `choice_required` 行确实包含两个时刻，I-08 可以提交其中一个。手输的双起点目前没有这样的正文，所以页面可以显示 `save_rejected`，但不能提供选择。

AC-P15 由这次拒绝覆盖。AC-P23，即选中两个手输时刻中的一个，按当前页面合同无法完成。用户于 2026-11-25 决定：要完成 AC-P23，需要技术设计改成返回这两个时刻。本次检查不做这个改动。页面仍显示 `save_rejected`，并且只有正文包含这些时刻时才画出选择。

## 计划对齐

实施计划没有修改。PT-023 构建表单并呈现 API 正文。它写明呈现留给这个 UI/UX 阶段。已批准的屏幕、令牌和状态就是那份呈现。这里没有把它们写进 PT-023。就绪审阅可以提出差额：在另行授权实现时，网站任务必须遵循 `05-visual-design.md` 和 `06-interaction-specifications.md`。该差额不在本文件中应用。

## 未决项

- Q-02：邮件没有设计。S-02 和 S-06 提交证明码。
- Q-03：没有画出产品标题。文档标题仍是脚手架标题。
- Q-04：From 和 To 开始是空的。两个都键入之前，Show range 不发送。
- GAP-PT-01：手输的双起点没有可绘制的返回时刻。
- Stage 5 仍是 READY FOR USER REVIEW。Stage 7 的发现在 `08-design-review.md`。对处理结果的复审尚未进行。
