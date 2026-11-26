# 视觉设计：个人时间

- 阶段：5 — 高保真视觉设计与交互说明
- 日期：2026-11-25
- 状态：用户于 2026-11-25 接受 Agenda 绘制。它取代 Direction L 的绘制，成为已接受的高保真说明。这次绘制的 Stage 6 校验记在 `13-visual-validation.md`。这次接受不授权应用代码。
- 工作结构：`04-wireframes.md` 和 `12-page-specifications.md` 中已接受的 Agenda 草图。
- 令牌：`tokens/design-tokens.json` 中已批准的 Agenda 基线。页面使用语义令牌或组件令牌。
- 来源页面：`previews/gate1-agenda.html`。
- 组件：PT-C01 至 PT-C10 仍是控件名称。它们的绘制是下面的 Agenda 基线。
- 交互：`06-interaction-specifications.md`。
- Q-02、Q-03 和 Q-04 仍开放。没有屏幕命名产品标题、绘制邮件，或填入第一次的 `from` 和 `to`。
- 图片不是依据。这些令牌引用是可编辑的说明。
- 英文文件是规范文本。
- 本文件不替换 `docs/ui-ux/05-visual-design.md`。
- 本阶段没有做独立的 UI/UX 评审。

## 1. 套用的方向

Agenda 是浏览器里的一条浅色列。页面背景是 `semantic.color.canvas` 和 `component.page.elevation`。任务标题和安静链接在同一行。S-07 用返回的 `date` 和发丝线分开每次出现，不靠卡片或阴影。强调色用于已就绪的主要按钮、焦点环和选中行的标记。公开、私密、`scheduled`、`skipped`、`choice_required`、冲突和失败都保留文字。

任务标题使用 `component.page.title-size`、`component.page.title-line`、`component.page.title-weight` 和 `component.page.title-track`，颜色是 `component.page.text`。出现标题使用 `component.row.title-size`、`component.row.title-line` 和 `component.row.title-weight`。正文使用 `semantic.font.body-size` 和 `semantic.font.body-line`。安静操作使用 `component.button.quiet-size` 和 `component.button.quiet-text`。安静操作在悬停时加下划线，不获得填充。显示名使用 `semantic.font.name-size`。开始、结束、公历日和已存储的重复类型使用 `semantic.font.meta-size`、`semantic.font.meta-line`、`semantic.color.text-meta` 和 `semantic.font.figures`。

浏览器文档标题仍是脚手架标题。Q-03 仍开放，所以本阶段不在任务标题或文档标题里画产品名。

Agenda 基线没有失败色，也没有危险文字令牌。失败是正文尺寸、`semantic.color.text-primary` 的返回 `result` 词。字段边框不变。EX-PT-01：一条线的宽度是 `component.field.border-width`，颜色是 `semantic.color.border-hairline`。EX-PT-02：S-07 在事实列里画可见性和状态的词。它不画 Direction L 的几何标记。

`semantic.motion.feedback` 是 0 ms，所以结果就地出现。没有入场动效需要减弱。

## 2. 共用框架

列宽是 `component.page.content-max`。页面内边距是 `component.page.padding-block` 和 `component.page.padding-inline`，最后一块区域之后是 `component.page.padding-end`。低于 `component.page.stack-below` 时，S-07 的工具行和出现行改成一列。页面滚动。布局不会变成导航轨或月历。

```text
padding component.page.padding-block and component.page.padding-inline
任务标题和安静链接在同一行
命令区域
发出上一条命令的区域下面的 PT-C09
```

链接是安静文字，不是强调色填充，也不是提交。

焦点是 `component.button.focus-width` 宽、`component.button.focus-color` 色的环，偏移 `component.button.focus-offset`，画在控件外面。浅底和强调条出现在 S-07 上焦点所在控件的那次出现，使用 `component.row.selected-wash`，以及 `component.row.selected-mark-width` 宽、`component.row.selected-mark` 色的前导条。焦点离开该出现后，它们消失。冲突行不使用它们。冲突行里的焦点只在控件的焦点环上。行本身不导航。PT-C09 在显示 `result` 时是一条提示。焦点留在被激活的控件上。命令在途时标签不变。如果该控件已不在页面上，焦点按视觉顺序移到下一个仍在的控件；没有则移到任务标题。

PT-C03 和 PT-C05 使用 `component.field.height`、`component.field.radius`、`component.field.padding-inline`、`component.field.background`、`component.field.text`、`component.field.border` 和 `component.field.border-width`。标签使用 `component.field.label` 和 `semantic.font.label-size`，与字段的间距是 `component.field.label-gap`。密码字段用同一个框并遮盖取值。

说明是同一个字段框。最小高度是一行 `semantic.font.body-line`，并按这个行高增高。换行保持可见。

PT-C02 的主要按钮使用 `component.button.height`、`component.button.radius`、`component.button.padding-inline`、`component.button.primary-background`、`component.button.primary-text` 和 `component.button.primary-weight`。安静按钮使用画布上的 `component.button.quiet-text`。同一区域的按钮以 `semantic.space.inline` 排成一行，列变窄时换行。

PT-C10 留在列内。它使用画布背景、顶部发丝线和 `component.page.text`。Delete 使用主要外观。Cancel 是安静的。它不是对话框，也没有阴影。

## 3. 未登录表面

S-01 至 S-06 共用这套绘制。每个任务标题是已接受清单里的表面名称。其他未登录表面的名称是标题行上的安静链接。一个已就绪的主要按钮使用强调色填充。字段保持纵向堆叠。PT-C09 在该按钮下面。

| 这些表面上的结果 | 绘制 |
|---|---|
| `registration_rejected`、`verification_rejected`、`cancellation_rejected`、`login_rejected`、`recovery_rejected`、`send_failed`、`operation_failed`、`save_rejected`、`logged_out` | 只有 `result` 字符串，正文尺寸，`semantic.color.text-primary` |
| 在途 | `semantic.color.text-meta` 中的词 `waiting`。它不是 API 结果。 |
| S-01 或 S-03 上的 `ok` | `semantic.color.text-primary` 中的字符串 `ok`。没有第二句。已输入的值保留。 |
| S-02 或 S-06 上的 `ok` | 可见页面变成 S-04。不画日历。 |

S-04 和 S-05 上的 `login_rejected` 使用同一套失败绘制。S-05 不加第二行。在没有可用会话时打开 `/calendar`、`/events/new`、`/events/:id` 或 `/account`，画出 S-04，包括 `logged_out`，并且不画日历行和事件字段。

## 4. S-07 自己的日历

任务标题是 “Own Calendar”。“New event” 和 “Account” 是标题行上的安静链接。From、To 和 Show range 共用一行工具。任一日期为空时，Show range 使用安静外观。两个都有已输入的日期时，Show range 使用主要外观。工具行下面的显示名使用 `semantic.font.name-size` 和 `semantic.color.text-meta`。

每个返回的 `date` 是一个日期标签：`component.day.size`、`component.day.line`、`component.day.weight`、`component.day.track` 和 `semantic.font.figures`，下面有 `component.day.rule` 的发丝线。页面不编造星期。

每次出现是一行。事实列宽是 `component.row.facts-size`。词使用 `semantic.font.meta-size`、`component.row.facts-line` 和 `semantic.color.text-meta`。标题和安静操作在同一行，低于 `component.page.stack-below` 时也是如此。状态是 `scheduled` 时，开始和结束是 meta。地点和说明是正文。说明保留换行。空的地点或说明是空白，不用替代词。低于 `component.page.stack-below` 时，工具行和出现行改成一列。

| 行 | 绘制 |
|---|---|
| `scheduled` | 事实列里的可见性和 `scheduled`，然后是开始和结束 |
| 系列 `scheduled` | 同一行，加上安静的 “Series” 和 “This occurrence” |
| `skipped` | 事实列里的词 `skipped`。没有删除线，也没有删除控件 |
| `choice_required` | 事实列里的词 `choice_required`。返回的公历日是 meta，不是可编辑字段。两个选项显示返回的时刻，都不预选 |

在选中一个时刻之前，Submit choice 使用安静外观。选中之后，同一控件使用主要外观。返回正文没有出现时，画出工具行和显示名，不画行，也不画成功句。

## 5. S-08 事件

任务标题是 “Event”。“Calendar” 和 “Account” 是标题行上的安静链接。创建时纵向画出 Title、Start、End、Location 和 Description，然后是可见性和重复选择。Start 和 End 各显示一个公历日和一个钟点。Private 是选中的单选。四种重复选项都未选。在选中一个选项之前 Save 使用安静外观，选中后使用主要外观。不重复的选项提交 `none`。Cancel 是安静的。

编辑画出已存储的值。已存储的可见性是选中的单选。已存储的类型是 meta，没有重复控件。Save 是主要按钮。Delete 在 PT-C10 展开之前是安静的。

一次出现画出正文 “This occurrence” 和 meta 中的返回开始时刻。Save 是主要按钮，删除控件写 “Delete this occurrence”。Series 是安静控件。

PT-C10 画出动作名称，然后是主要外观的 “Delete” 和安静的 “Cancel”。

| 返回正文 | 绘制 |
|---|---|
| 没有 `conflicts` 的 `ok` | 正文中的字符串 `ok`。没有第二句。安静的 Calendar 链接仍在 |
| 有 `conflicts` 的 `ok` | 正文中的字符串 `ok`，然后每个条目一行。标题是正文。开始和结束是 meta。没有可见性词，也没有强调色。没有第二句成功语 |
| `continuesAfterWindow: true` | 冲突行之外的一行，颜色是 `semantic.color.text-meta` |
| `save_rejected` | `semantic.color.text-primary` 中的 `result` 字符串 |
| `monthTypes` 和 `missingDates` | 这些返回值是结果字符串下面的正文 |
| 键入的双起点有两个时刻 | 只为那些返回的时刻画选择 |
| `not_found` 或 `account_gone` | `semantic.color.text-primary` 中的 `result` 字符串。只有正文仍包含事件字段时才保留它们 |

## 6. S-09 账户

任务标题是 “Account”。Calendar 是标题行上的安静链接。Nickname 和 Timezone 是分开的区域，各有自己的主要按钮：“Save nickname” 和 “Save timezone”。结果使用共用的 PT-C09 绘制。Log out 是安静的。Delete account 在 PT-C10 之前是安静的。PT-C10 写出账户删除，然后显示主要外观的 “Delete” 和安静的 “Cancel”。

已提交的退出或已提交的删除画出 S-04。那个替换页面不画账户字段，包括它们的值。没有提交的删除保持这套绘制，并显示返回的 `result`。
