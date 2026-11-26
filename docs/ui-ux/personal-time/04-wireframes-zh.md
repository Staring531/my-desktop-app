# 线框：个人时间

- 阶段：4 — 线框与页面说明
- 日期：2026-11-25
- 状态：用户于 2026-11-25 接受 Agenda 修订。它取代 Direction L 草图，成为已接受的低保真结构。Stage 5 的绘制于同日在 `05-visual-design.md` 被接受。这些接受不授权应用代码。
- 本阶段为什么是低保真：`docs/process/UI_UX_DESIGN.md` 的 Stage 4 先确定区域、层次、控件、焦点和状态。Stage 5 再把已批准的令牌和组件用到每一种状态上。用户于 2026-11-25 开始 Stage 4，并询问为什么这一阶段不是高保真。该问题不改变这一阶段。
- 已批准的输入：`01-information-architecture.md` 中的 S-01 至 S-09 和路径；`02-user-flows.md` 中的流程；已批准的 Agenda 页面和 `tokens/design-tokens.json`。PT-C01 至 PT-C10 仍是控件名称。它们的绘制跟随 Agenda 基线。
- 页面合同：`12-page-specifications.md`。
- Q-02、Q-03 和 Q-04 仍开放。没有草图命名产品标题、绘制邮件，或填入第一次的 `from` 和 `to`。
- 文字草图是可编辑的来源。图片不是依据。
- 英文文件是规范文本。
- 本文件不替换 `docs/ui-ux/04-wireframes.md`。
- 本阶段没有做独立的 UI/UX 评审。

## 共用页面

每个表面使用一列，宽度是 `component.page.content-max`，内边距用 Agenda 页面的内边距。任务标题和安静链接在同一行。低于 `component.page.stack-below` 时，工具行和出现行改成一列并滚动。不会变成导航轨、月网格或主题控件。

```text
+--------------------------------------------------+
| 任务标题                    安静链接             |
| 命令区域                                         |
| 本页上一条命令的 PT-C09 结果                     |
+--------------------------------------------------+
```

任务标题是已接受清单里的表面名称。S-07 使用 Own Calendar，与已批准的 Agenda 页面一致。脚手架标题不画出。未登录表面链接到其他未登录表面。已登录表面使用下面各草图中的链接。字段保持纵向堆叠。S-07 是例外：From、To 和 Show range 共用一行工具。

焦点从视觉顺序上的第一个控件开始。页眉上的安静链接和任务标题在第一行，所以它们在字段和命令按钮之前。Tab 按这个顺序移动。在单行字段里按 Enter，激活该字段所属区域的主要按钮。在 Description 里按 Enter 插入换行，不激活 Save。只有当确认步骤没有命令在途时，Escape 才关闭已展示的 PT-C10 并且不发送。

## S-01 注册

行动者：没有会话。路径：`/register`。流程 F-01。

```text
Register
Verify    Cancel registration    Log in
Start recovery    Complete recovery

Username
[________________________]
Email
[________________________]
Password
[________________________]
Nickname
[________________________]
[Register]
Result line
```

不画时区字段。命令仍然发送浏览器的 IANA 名称。焦点：安静链接，然后是 Username、Email、Password、Nickname、Register。`ok` 留在这张草图上，不打开日历。`registration_rejected`、`send_failed`、`operation_failed` 和 `save_rejected` 留在这里。已输入的值保留。结果不说明哪个值被占用。

## S-02 验证

行动者：持有验证证明的人。没有会话。路径：`/verify`。流程 F-02。

```text
Verify
Register    Cancel registration    Log in
Start recovery    Complete recovery

Proof
[________________________]
[Verify]
Result line
```

焦点：安静链接，然后是 Proof、Verify。`ok` 离开这张草图，进入 S-04，并且不打开 S-07。`verification_rejected` 留在这里。命令在途时，结果行显示 `waiting`。

## S-03 取消注册

行动者：没有会话。路径：`/register/cancel`。流程 F-03。

```text
Cancel registration
Register    Verify    Log in
Start recovery    Complete recovery

Email
[________________________]
Password
[________________________]
[Cancel registration]
Result line
```

焦点：安静链接，然后是 Email、Password、Cancel registration。`ok` 和 `cancellation_rejected` 留在这张草图上。不画已验证账户的删除。

## S-04 登录

行动者：没有可用会话。路径：`/login`。流程 F-04。这张草图也是受保护目的地的状态。

```text
Log in
Register    Verify    Cancel registration
Start recovery    Complete recovery

Email
[________________________]
Password
[________________________]
[Log in]
Result line
```

焦点：安静链接，然后是 Email、Password、Log in。`ok` 离开这张草图，进入 S-07。`login_rejected` 留在这里。结果行与 S-05 上同一个字符串使用同一个组件。

没有可用会话时打开 `/calendar`、`/events/new`、`/events/:id` 或 `/account`，画出这张草图和结果 `logged_out`。不画日历行或事件字段。本阶段不增加第二个已登出目的地。

## S-05 开始找回

行动者：一个人。路径：`/recovery`。流程 F-05。

```text
Start recovery
Register    Verify    Cancel registration
Log in    Complete recovery

Email
[________________________]
[Start recovery]
Result line
```

焦点：安静链接，然后是 Email、Start recovery。结果是 `login_rejected`、`send_failed` 或 `operation_failed`。`login_rejected` 这一行与 S-04 相同。草图里没有“证明已发出”这样的句子。

## S-06 完成找回

行动者：持有找回证明的人。路径：`/recovery/complete`。流程 F-05。

```text
Complete recovery
Register    Verify    Cancel registration
Log in    Start recovery

Email
[________________________]
New password
[________________________]
Proof
[________________________]
[Complete recovery]
Result line
```

焦点：安静链接，然后是 Email、New password、Proof、Complete recovery。`ok` 离开这张草图，进入 S-04，并且不打开 S-07。`recovery_rejected` 留在这里。不画会话控件。命令在途时，结果行显示 `waiting`。

## S-07 自己的日历

行动者：本会话中已验证的所有者。路径：`/calendar`。流程 F-06 和 F-09。

```text
Own Calendar                         New event    Account

From [______________]  To [______________]  [Show range]
Display name from the body

returned date
visibility        Title                              [Event]
state             start
                  end
                  location
                  description
                  display name

returned date
visibility        Title                    [Series] [This occurrence]
state             start
                  end
                  display name

returned date
skipped           Title
                  display name

returned date
choice_required   Title
                  civil date from the body, not editable
                  ( ) first returned instant
                  ( ) second returned instant
                  [Submit choice]

Result line
```

`From` 和 `To` 是空的。Q-04 仍开放，因此在范围返回之前，草图不画初始日期，也不画行。任一日期为空时，Show range 不发送。低于 `component.page.stack-below` 时，工具行和每次出现改成一列。标题和安静操作仍在同一行。焦点：New event、Account、From、To、Show range，然后从上到下的各行。浅底和强调条出现在焦点所在的那次出现上，焦点离开后消失。

`scheduled` 行只在该状态显示开始和结束。它的 Event 控件打开 `/events/:id`。系列行增加 This occurrence，打开同一路径的单次出现状态，并带上返回的开始时刻。跳过的行没有已取消标记，也没有删除控件。选择行列出返回的两个时刻，都不预选。在选中其中一个时刻之前，Submit choice 保持安静并且不发送。显示的公历日是该返回出现上的日期。

`logged_out`，以及没有日历和事件的正文，使用 S-04 的草图，不用这一张。

## S-08 事件

行动者：所有者。路径：`/events/new` 和 `/events/:id`。流程 F-07 和 F-08。一次出现是这个目的地的一种状态。

创建：

```text
Event
Calendar    Account

Title
[________________________]
Start
[________________________]
End
[________________________]
Location
[________________________]
Description
[                        ]
(selected) private
( ) public
( ) non-repeating
( ) daily
( ) weekly
( ) monthly
[Save]    [Cancel]
Result line
```

编辑已存储的事件或系列：

```text
Event
Calendar    Account

Title, Start, End, Location, Description
as entered fields showing the stored values
(selected visibility)
Stored kind, as meta text, with no repetition control
[Save]    [Cancel]
[Delete]
Result line
```

一次出现：

```text
Event
Calendar    Account

This occurrence
returned start, as meta text
Title, Start, End, Location, Description
Visibility choice showing the stored value
[Save]    [Cancel]
[Delete this occurrence]
[Series]
Result line
```

焦点：Calendar、Account，然后是字段、选择组、Save、Cancel，以及存在时的删除控件。在 Description 里按 Enter 插入换行，不激活 Save。创建时没有预选的重复类型。私密是选中的。在选中一种重复之前，Save 保持安静并且不发送。不重复选项发送 `none`。Cancel 回到 S-07 并且不发送。Start 和 End 是一起键入的公历日和时钟。已有事件的 Save 不发送类型。一次出现的 Save 发送分离命令和返回的原始开始时刻。Series 回到 `/events/:id` 上的编辑草图，它本身不发送。

删除控件在堆叠中展示 PT-C10。它不打开另一个目的地。

```text
Delete this event
The stored event stays until the confirming command.
[Delete]    [Cancel]
```

一次出现的状态使用同一块区域，文字改成那一次出现。区域内的 Cancel 不发送并收起该区域。Delete 发送对应的删除命令。没有提交的结果留在 S-08，并保留原先的值。

`ok` 留在 S-08，以便显示返回正文。正文里有冲突时，冲突行在结果区域，只含标题、开始和结束。空列表不画冲突行。`continuesAfterWindow` 为真时，这些行之外有一句次要文字：重复在 90 天之后继续。安静的 Calendar 链接回到 S-07。`save_rejected` 留在这里。正文包含 `monthTypes` 和 `missingDates` 时，这些返回值是结果字符串下面的文字。键入的双起点只有在返回正文包含那些时刻时才画 PT-C06。草图不发明第三个时刻，也不自行标注那些纽约时间例子。

## S-09 账户

行动者：所有者。路径：`/account`。流程 F-04、F-09、F-10 和 F-11。

```text
Account
Calendar

Nickname
[________________________]
[Save nickname]

Timezone
[________________________]
[Save timezone]

Result line
[Log out]
[Delete account]
```

焦点：Calendar、Nickname、Save nickname、Timezone、Save timezone、Log out、Delete account。在 Nickname 里按 Enter 激活 Save nickname。在 Timezone 里按 Enter 激活 Save timezone。不画邮箱字段。

Delete account 使用与 S-08 相同的 PT-C10：

```text
Delete this account
The account stays until the confirming command.
[Delete]    [Cancel]
```

昵称或时区的结果留在这张草图上。Calendar 链接回到 S-07。已提交的退出或已提交的账户删除离开这张草图并画出 S-04，不增加成功句。没有提交的删除留在这里，并保留账户字段。
