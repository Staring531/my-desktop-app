# 视觉设计

- 阶段：5 — 高保真视觉设计
- 日期：2026-11-20
- 状态：用户于 2026-11-20 连同 UI/UX 设计包一并接受。本文件把方向 L 和已批准的 Token 基线用到已接受的 Stage 4 草图上。该接受不授权应用代码。
- 当前结构：`04-wireframes.md` 和 `12-page-specifications.md`，于 2026-11-20 随本包接受。
- Token：`tokens/design-tokens.json` 和 `10-design-tokens.md`。页面使用语义或组件 Token。
- 组件：`11-component-specifications.md` 中的 C-01 到 C-09。
- 用户于 2026-11-20 关闭 Q-04。移除、删除和解散在同一表面确认。没有对话框。
- 没有图片充当事实来源。这些尺寸是可编辑的规格。
- 英文 `05-visual-design.md` 是规范文本。本文件是对照译文。评审之后英文文件又有修订。若两者冲突，以英文为准。界面上的规范用词以英文文件为准；下面的中文标签与 `04-wireframes-zh.md` 对齐，便于对照。

## 1. 已应用的方向

方向 L 仍是一个浅色、紧凑的桌面仪器。窗口是一块画布，`semantic.color.canvas`，阴影为 `semantic.elevation.flat`。区域用 `semantic.space.region` 和发丝线分隔，不用卡片，也不用阴影。强调色只用于主要按钮、焦点环和选中行标记。忙碌、空闲、团队和仅自己都是 `component.mark.text` 中的记号加文字。

窗口标题是现有文档标题 “My Desktop App”。表面标题使用 `semantic.font.title-size`、`semantic.font.title-line` 和 `semantic.font.title-weight`，颜色为 `semantic.color.text-primary`。行文使用正文角色。时区名、时钟标签和保留事件的所有者电子邮件使用辅助角色和 `semantic.color.text-meta`。区域标签使用正文角色和 `semantic.color.text-secondary`。

一条例外，EX-01：区域分隔线是 `semantic.color.border-hairline` 上的 `primitive.size.rule`。Token 集没有语义边框宽度。该值是已批准的 1 px 线。除此之外不引入原始值。

`semantic.motion.feedback` 是 0 ms，所以结果或通知在原处出现。没有需要减弱的入场动效。

## 2. 共用外框

初始窗口是 `primitive.size.window-width` 乘 `primitive.size.window-height`。更窄或更矮的窗口保持同一条纵向堆叠。外壳行留在滚动区域之外。该行下面的表面是唯一的滚动区域。行内操作放不下时折到文字下方。布局不会变成第二列导航。

```text
内边距 semantic.space.inset
[ My Desktop App          {已知时，辅助文字中的时区}  打开另一个会话 ]
发丝线
表面标题
区域，间距为 semantic.space.region
发出命令的控件下方的 C-08
```

外壳行至少为 `component.button.height`。行内间距是 `semantic.space.inline`。“打开另一个会话”在每个表面上是 C-02 安静按钮。投影没有时区时不显示时区。内容位于 `semantic.layer.content`。

显示 S-08 时，C-09 使用 `component.notice.background`、`component.notice.padding`、`component.notice.rule`、`component.notice.text` 和 `component.notice.layer`。它位于外壳行之下、表面之上。它不是吐司，也不是第二个窗口。

焦点是控件外侧的环，宽度 `component.button.focus-width`，颜色 `component.button.focus-color`。含有焦点控件的行同时使用 `component.row.selected-wash`，以及宽度为 `component.row.selected-mark-width`、颜色为 `component.row.selected-mark` 的前导条。行本身仍然不导航。

## 3. 表面

### S-01 绑定这个会话

标题“绑定这个会话”。一个标签为“电子邮件”的 C-03，然后是 C-02 主要按钮“绑定”，然后是 C-08。字段使用 `component.field.height`、`component.field.radius`、`component.field.background`、`component.field.text` 和 `component.field.border`。堆叠间距是 `semantic.space.stack`。被拒绝的电子邮件保留已输入的值，边框改为 `semantic.color.text-danger`。绑定是唯一的主要按钮。

### S-02 创建团队

标题“创建团队”。正文“这个会话是 {电子邮件}”，颜色 `semantic.color.text-primary`。没有电子邮件字段。C-02 主要按钮“创建团队”，然后是 C-08。

### S-03 这份邀请

标题“邀请”。受邀电子邮件是正文。C-02 主要按钮“接受”和 C-02 安静按钮“拒绝”在同一行，间距 `semantic.space.inline`，窗口窄时折行。没有名册、事件或忙闲区域。

### S-04 没有团队访问权

标题“没有团队访问权”。正文“{电子邮件} 不能查看这个团队。”，颜色 `semantic.color.text-secondary`。没有主要按钮，也没有写入控件。

### S-05 团队工作区

标题“团队”。时刻行是正文“正在查看 {时刻}”，时钟使用投影时区，然后是 C-02 安静按钮“现在”。只有操作系统字体本身提供等宽数字时才使用等宽数字。不加载第二种字体。

区域“成员”，然后是 C-07 行。每行至少 `component.row.min-height`，内边距 `component.row.padding-inline`，底边线 `component.row.rule`。C-06 显示实心方块和“忙碌”，或空心方块和“空闲”，然后是成员电子邮件。没有单独的显示名。仅维护者可以在其他成员的行上看到安静按钮“设为维护者”和危险按钮“移除”。查看者自己的行上没有它们，普通成员也看不到它们。

区域“事件”。C-06 显示实心方块和“团队”，或空心方块和“仅自己”，然后是标题，再是辅助文字“{开始} – {结束}”。后面是安静按钮“看开始”“看结束”和“编辑”。保留的团队可见事件在辅助文字中加上已存储的所有者电子邮件。事件列表为空时，正文显示“没有事件”，颜色 `semantic.color.text-secondary`。成员忙闲板和 C-02 主要按钮“新建事件”仍然在。“新建事件”是这个表面上唯一的主要按钮。

区域“待处理邀请”只在操作者是维护者且投影至少有一个待处理地址时渲染。每个地址是一行 C-07，带安静按钮“取消邀请”。

区域“邀请”只对维护者渲染。标签为“电子邮件”的 C-03 和安静按钮“邀请”同一行，需要时折到字段下方。“邀请”不是第二个主要按钮。

C-02 危险按钮“解散”只在投影表明该操作者是唯一成员时渲染。它位于各区域之后，文字颜色 `component.button.danger-text`，在画布上，没有填充的危险背景。

C-08 位于发出上一条命令的控件下方。

### S-06 一个事件

外壳保持不变。这个表面替换 S-05 的主体。标题是“新建事件”或“编辑事件”。

创建时从上到下，堆叠间距 `semantic.space.stack`：

- C-05“可见性”，选项“团队”和“仅自己”，都不预选。
- C-03“标题”，单行。
- C-03“地点”，单行。
- C-03“描述”，多行，按 `semantic.font.body-line` 增高。
- C-04“开始”和 C-04“结束”。各是一行，格式由 I-10 规定。没有日历。
- 辅助文字“时区 {投影时区}”，只读。
- C-02 主要按钮“保存”和 C-02 安静按钮“取消”。

创建者编辑使用同样的字段。已存储的可见性被选中。开始和结束一开始是辅助文字，并带有安静按钮“更改开始”和“更改结束”。只有使用了对应控件之后，那个时钟才变成 C-04。

保管编辑没有 C-05。正文“团队”只读。标题、地点、描述、时钟、保存、取消和危险按钮“删除”仍然保留。

含糊字段在该字段下增加 C-05：“开始时间出现了两次。”或“结束时间出现了两次。”，选项“较早”和“较晚”，都不预选。两者都含糊时，命令先报告开始。只有后续提交仍然对结束返回 `ambiguous-local-time` 时，才出现结束的选择。不能修改该事件的当前成员看到只读文字：所有者邮箱、可见性、标题、地点、描述和两个钟点。没有保存、删除和改钟点控件。取消保留。

危险按钮“删除”只出现在该操作者可以删除的已有事件上。创建时没有。C-08 位于失败的控件下方。

### S-07 记录不可读

标题“这份团队记录无法读取。”正文“不会创建替代团队。”C-08 以 `semantic.color.text-danger` 显示 `record-unreadable`。没有创建控件。外壳中的“打开另一个会话”仍然在。

### S-08 已有写入者

C-09 文字“已经有一个写入者。”和安静按钮“关闭”。下面的表面不变。没有拿到锁的进程没有外框。

## 4. 状态外观

| 状态 | 外观 |
|---|---|
| 命令进行中 | 发出命令的按钮保持原变体，标签改为 `06-interaction-specifications.md` 中的进行中动词。没有旋转指示。 |
| 拒绝或校验 | C-08 使用 `semantic.color.text-danger`。被拒绝的字段边框也使用 `semantic.color.text-danger`。已输入的文字保留。 |
| 成功 | 新投影重绘表面。没有成功吐司。 |
| 禁用 | 控件留在原处，文字为 `semantic.color.text-meta`，并且不提交。 |
| 没有事件 | “没有事件”，加上忙闲板和“新建事件”。 |
| 选中行 | 该行含有焦点时显示淡色底和前导条。 |

## 5. 窗口行为

在 1200×800 和更小尺寸时，区域按上面的顺序堆叠。外壳行保持可见。只有它下面的表面滚动。小于初始尺寸时，同一顺序折行。不会收成导航栏、日历，或窗口内的第二个会话。不增加最小或最大窗口尺寸。

## 6. 本规格不包含的内容

没有深色主题、主题控件、确认对话框、时区选择器、重复事件控件或全天事件控件。Q-04 不在这里决定。Website、Admin 和 API 仍不在 Version 1 内。
