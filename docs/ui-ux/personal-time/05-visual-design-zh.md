# 视觉设计：个人时间

- 阶段：5 — 高保真视觉设计与交互说明
- 日期：2026-11-25
- 状态：纳入用户于 2026-11-25 批准的 UI 包。本文件把 Direction L 和已批准的令牌基线用到同日接受的 Stage 4 草图上。这次批准不授权应用代码。交接是 `15-handoff.md`。
- 工作结构：`04-wireframes.md` 和 `12-page-specifications.md`。
- 令牌：`tokens/design-tokens.json` 和 `10-design-tokens.md`。页面使用语义令牌或组件令牌。
- 组件：`11-component-specifications.md` 中的 PT-C01 至 PT-C10。
- 交互：`06-interaction-specifications.md`。
- Q-02、Q-03 和 Q-04 仍开放。没有屏幕命名产品标题、绘制邮件，或填入第一次的 `from` 和 `to`。
- 图片不是依据。这些令牌引用是可编辑的说明。
- 英文文件是规范文本。
- 本文件不替换 `docs/ui-ux/05-visual-design.md`。
- 本阶段没有做独立的 UI/UX 评审。

## 1. 套用的方向

Direction L 是浏览器里的一条浅色列。页面背景是 `semantic.color.canvas` 和 `semantic.elevation.flat`。区域靠 `semantic.space.region` 和发丝线分开，不靠卡片或阴影。强调色只用于已就绪的主要按钮、焦点环和选中行的标记。公开、私密、`scheduled`、`skipped`、`choice_required`、冲突和失败都保留文字。

任务标题使用 `semantic.font.title-size`、`semantic.font.title-line` 和 `semantic.font.title-weight`，颜色是 `component.page.title-color`。字段、行标题和结果字符串使用正文角色。显示名、时钟时间、公历日和已存储的重复类型使用辅助角色和 `semantic.color.text-meta`。时钟时间和公历日同时使用 `semantic.font.figures`。安静链接使用正文尺寸的 `component.button.quiet-text`。

浏览器文档标题仍是脚手架标题。Q-03 开放，因此本阶段不在任务标题或文档标题里画产品名称。

一条例外，EX-PT-01：区域或行的线宽是 `primitive.size.rule`，颜色是 `semantic.color.border-hairline`。令牌集没有语义边框宽度。这个值是已批准的 1 像素线。不再引入其他原始值。

`component.result.duration` 是 0 毫秒，因此结果就地出现。没有需要减弱的入场动效。

## 2. 共用框架

列宽是 `component.page.content-max`。页面内边距是 `component.page.inset`。更窄的视口保持同一条纵向堆叠并滚动页面。行内动作换到行文字下方。布局不会变成导航轨或第二列。

```text
inset component.page.inset
任务标题
安静链接，间距 semantic.space.inline
发丝线
区域，间距 semantic.space.region
上一条命令所属区域下面的 PT-C09
```

内容位于 `semantic.layer.content`。链接行可以换行。链接是安静文字，不是强调色填充，也不是提交。

焦点是控件外的一圈环，宽度 `component.button.focus-width`，颜色 `component.button.focus-color`。选中的出现行使用 `component.row.selected-wash`，以及 `component.row.selected-mark-width` 宽、`component.row.selected-mark` 色的前导条。冲突行不使用它们。冲突行里的焦点只是控件上的焦点环。行本身仍然不导航。PT-C09 在显示 `result` 时是一条提示。焦点留在被激活的控件上。命令在途时标签不变。若该控件已不在页面上，焦点按视觉顺序移到下一个仍在的控件；没有时移到任务标题。

PT-C03 和 PT-C05 使用 `component.field.height`、`component.field.radius`、`component.field.padding-inline`、`component.field.background`、`component.field.text`、`component.field.border` 和 `component.field.border-width`。标签是字段上方的正文，标签、字段和下一个标签之间的间距是 `semantic.space.stack`。共用失败不把某一个字段的边框改成失败色。边框保持 `component.field.border`。密码字段使用同一个盒子并遮盖取值。

说明使用同一个字段盒子。最小高度是一行 `semantic.font.body-line`，并按该行高增长。换行保持可见。

PT-C02 的高度是 `component.button.height`，圆角是 `component.button.radius`，横向内边距是 `component.button.padding-inline`。主要按钮使用 `component.button.primary-background` 和 `component.button.primary-text`。安静按钮使用底上的 `component.button.quiet-text`。危险按钮使用底上的 `component.button.danger-text`。同一区域的按钮排在一行，间距 `semantic.space.inline`，列宽不够时换行。

PT-C10 使用 `component.confirm.padding`、`component.confirm.background`、`component.confirm.text`，以及 `component.confirm.rule` 的顶线。它留在列内，层级是 `component.confirm.layer`。它不是对话框，也没有阴影。

## 3. 未登录表面

S-01 至 S-06 共用这套画法。每个任务标题是已接受清单里的表面名称。其他未登录表面的名称是安静链接。一个主要按钮使用强调色填充。PT-C09 在该按钮下面。

| 这些表面上的结果 | 画法 |
|---|---|
| `registration_rejected`、`verification_rejected`、`cancellation_rejected`、`login_rejected`、`recovery_rejected`、`send_failed`、`operation_failed`、`save_rejected`、`logged_out` | `component.result.failure-text`，正文尺寸，只有 `result` 字符串 |
| 在途 | `semantic.color.text-secondary` 中的词 `waiting`。它不是 API 结果。 |
| S-01 或 S-03 上的 `ok` | `component.result.body-text` 中的字符串 `ok`。没有第二句。已输入的值保留。 |
| S-02 或 S-06 上的 `ok` | 可见页面变成 S-04。不画日历。 |

S-04 和 S-05 上的 `login_rejected` 使用同一种失败画法。S-05 不增加第二行。受保护地打开 `/calendar`、`/events/new`、`/events/:id` 或 `/account` 时，画出 S-04 和 `logged_out`，不画日历行，也不画事件字段。

## 4. S-07 自己的日历

任务标题是 “Calendar”。“New event” 和 “Account” 是安静链接。From 和 To 是 PT-C04。任一为空时，Show range 使用安静外观。两个都有键入的日期时，Show range 使用主要外观。字段下方的显示名是辅助文字，取值来自正文。

每次出现是一个 PT-C08 行：最小高度 `component.row.min-height`，内边距 `component.row.padding-inline`，底线 `component.row.rule`。标记尺寸是 `component.mark.size`，颜色是 `component.mark.text`，后面是同色的 API 用词。标题、地点和说明是正文。说明保留换行。开始、结束、公历日和显示名是带等宽数字的辅助文字。空的地点或说明保持空白，不用替代词。

| 行 | 画法 |
|---|---|
| `scheduled` | 可见性标记和词，然后是 `scheduled`，然后是开始和结束 |
| 系列的 `scheduled` | 同一行，加上安静的 “Series” 和 “This occurrence” |
| `skipped` | 短横标记和 `skipped`。没有删除线，也没有删除控件 |
| `choice_required` | 双刻度标记和 `choice_required`。返回的公历日是辅助文字，不是可编辑字段。两个 PT-C06 选项显示返回的时刻，都不预选 |

在选中一个时刻之前，Submit choice 使用安静外观。选中之后，同一个控件使用主要外观。正文没有出现的范围画出字段和显示名，不画行，也不画成功句。

## 5. S-08 事件

任务标题是 “Event”。“Calendar” 和 “Account” 是安静链接。创建画出 Title、Start、End、Location 和 Description，然后是 PT-C06。Start 和 End 各自显示公历日和时钟。私密是选中的单选。四种重复选项都未选。在选中一种之前，Save 使用安静外观，选中后使用主要外观。不重复选项提交 `none`。Cancel 是安静按钮。

编辑在同样的字段里画出已存储的值。已存储的可见性是选中的单选。已存储的类型是辅助文字，没有重复控件。Save 是主要按钮。在 PT-C10 展示之前，Delete 是安静按钮。

一次出现的状态以正文画出 “This occurrence”，以辅助文字画出返回的开始时刻。Save 是主要按钮，删除控件写着 “Delete this occurrence”。Series 是安静控件。

PT-C10 以 `component.confirm.text` 写出动作名称，然后是危险的 “Delete” 和安静的 “Cancel”。

| 返回正文 | 画法 |
|---|---|
| 没有 `conflicts` 的 `ok` | 正文中的字符串 `ok`。没有第二句。安静的 Calendar 链接仍在 |
| 带 `conflicts` 的 `ok` | 正文中的字符串 `ok`，然后每个条目一行 PT-C08。标题是正文。开始和结束是辅助文字。没有可见性标记，也没有强调色。没有第二句成功说明 |
| `continuesAfterWindow: true` | 冲突行之外的一行 `component.result.continuation-text` |
| `save_rejected` | `component.result.failure-text` 中的 `result` 字符串 |
| `monthTypes` 和 `missingDates` | 这些返回值是结果字符串下面的正文 |
| 键入的双起点返回两个时刻 | 只为这些返回的时刻画 PT-C06 |
| `not_found` 或 `account_gone` | 失败文字中的 `result` 字符串。只有正文仍包含事件字段时才保留那些字段 |

## 6. S-09 账户

任务标题是 “Account”。Calendar 是安静链接。Nickname 和 Timezone 是分开的区域，各自有主要按钮：“Save nickname” 和 “Save timezone”。结果使用共用的 PT-C09 画法。Log out 是安静按钮。在 PT-C10 展示之前，Delete account 是安静按钮。PT-C10 写出账户删除，然后显示危险的 “Delete” 和安静的 “Cancel”。

已提交的退出或已提交的删除画出 S-04。账户字段及其取值不画在那个替换页上。没有提交的删除保留这套画法，并显示返回的 `result`。
