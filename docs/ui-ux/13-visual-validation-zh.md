# 视觉验证

- 阶段：6 — 设计系统与视觉验证
- 日期：2026-11-20
- 状态：由主设计会话记录的设计产物核对。这不是独立评审，也不是运行时截图核对。
- 核对的材料：`tokens/design-tokens.json`、`05-visual-design.md`、`06-interaction-specifications.md`、`04-wireframes.md`、`12-page-specifications.md`、`11-component-specifications.md`、`02-user-flows.md`。
- 用户于 2026-11-20 接受 Stage 4 和 Stage 5。这些核对本身没有批准该包。
- 英文 `13-visual-validation.md` 是规范文本。本文件是对照译文。

## 证据

| 核对 | 预期 | 观察 | 状态 |
|---|---|---|---|
| Token 文件 | 已批准的浅色主题。语义和组件别名可以解析。 | `meta.status` 为 APPROVED，`tokenBaselineApproved` 为 true。语义颜色、字体、间距、阴影、动效和层级指向原始值。组件 Token 指向语义 Token 或已批准的原始尺寸。 | PASS |
| 页面上的原始值 | 页面使用语义或组件 Token，例外被点名。 | `05-visual-design.md` 只点名 EX-01：`primitive.size.rule` 配 `semantic.color.border-hairline`，因为没有语义边框宽度。没有引入其他原始颜色、字号或圆角。 | PASS |
| 组件复用 | S-01 到 S-08 使用 C-01 到 C-09。没有新组件。 | `05-visual-design.md` 的每个表面都点名这些组件。Q-04 不增加对话框。 | PASS |
| 一个主要操作 | 一个表面上一个主要按钮。 | 绑定、创建团队、接受，以及新建事件或保存，是各自表面点名的主要按钮。邀请、拒绝和维护者操作保持安静或危险。 | PASS |
| 状态 | 进行中、拒绝、成功、空、禁用、取消、含糊时间、记录不可读、第二个写入者。 | `05-visual-design.md` 第 4 节，以及 I-01 到 I-14。进行中只改按钮动词，不增加旋转指示。成功重绘投影，不增加吐司。 | PASS |
| 验收覆盖 | AC-001 到 AC-051 各有一个交互，或有理由不出现。 | `06-interaction-specifications.md` 的覆盖表点名了每个编号。AC-027 没有提醒交互。 | PASS |
| 非颜色状态 | 忙碌、空闲、团队和仅自己是记号加文字。 | 行上仍有 C-06 的文字。强调色限于主要按钮、焦点环和选中行标记。 | PASS |
| 动效 | 减少动效与规定的动效相同。 | `semantic.motion.feedback` 为 0 ms。没有规定入场动效。 | PASS |
| 窗口 | 现有的 1200×800 外框。更窄的窗口保持一列。 | 引用了 `primitive.size.window-width` 和 `window-height`。没有增加新的最小或最大尺寸。 | PASS |
| 破坏性确认 | 用户要求移除、删除和解散前在原处确认。 | I-15 规定了该步骤。第一次按下不发送。没有增加对话框。 | PASS |
| 范围 | 没有主题、日历、提醒、重复事件或全天控件。 | `05-visual-design.md` 第 6 节和 I-10。 | PASS |
| 对比度认证 | 设计时的比值不是认证审计。 | 比值仍是 `10-design-tokens.md` 中的说明。没有对渲染结果测量。 | NOT CHECKED |
| 运行时截图 | 推迟到编码被授权之后。 | 没有运行应用代码。 | NOT CHECKED |
| 独立评审 | 设计评审门禁上的单独只读评审者。 | 本记录没有启动。 | NOT CHECKED |

## 记录的例外

- EX-01，1 px 区域线，是唯一的 Token 层例外。
- 未选择可见性就按保存时，I-09 显示本地句子“请选择团队或仅自己。”不会调用领域。这句话不是结果代码。空的绑定和空的邀请不发送，并显示已有代码 `unusable-email`。
- 时钟输入 `YYYY-MM-DD HH:mm` 是已批准民用时间对象的呈现方式。它不是新的领域字段。

## 计划对齐

Implementation Plan 没有被修改。IMP-020 点名了绑定、另一个会话、一个事件、发生时刻选择和 `busyAt`。S-03、S-05 上的维护者操作和解散写在这里，是因为 PRD 要求它们。它们仍在该任务点名的渲染器清单之外。就绪审阅时可以提出计划差额。本文件不应用它。

## 开放项

用户于 2026-11-20 关闭 Q-04。确认步骤是 I-15。放弃含糊时间选择仍回到 S-05，并丢掉未发送的编辑。
