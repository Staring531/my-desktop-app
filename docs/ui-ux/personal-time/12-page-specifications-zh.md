# 页面说明：个人时间

- 阶段：4 — 线框与页面说明
- 日期：2026-11-25
- 状态：用户于 2026-11-25 与 `04-wireframes.md` 一起接受。这些页面组合已批准的组件。这次接受不批准 Stage 5 的上色，也不授权应用代码。
- 草图：`04-wireframes.md`。
- 令牌：只用语义令牌和组件令牌。没有新的原始值。
- Q-02、Q-03 和 Q-04 仍开放。
- 英文文件是规范文本。
- 本文件不替换 `docs/ui-ux/12-page-specifications.md`。
- 本阶段没有做独立的 UI/UX 评审。

共用行为：任务列是一条堆叠。更窄的视口滚动这条堆叠。PT-C09 在发出命令的页面上，不是单独的目的地。被拒绝的命令不改变已存储的行，并保留已输入的值。页面呈现返回正文，不重新计算时刻、重叠、月预览或证明结果。共用失败使用同一个结果字符串和同一个结果组件。没有页面解释哪个值被占用，或账户是否存在、是否已验证。

## S-01 注册

- 行动者与进入：没有会话的人。路径 `/register`。流程 F-01。
- 目标：提交注册，或保持未发送。
- 组件：PT-C01，用户名、邮箱、密码和昵称的 PT-C03，PT-C02 主要按钮 Register，PT-C02 安静链接，PT-C09。
- 布局：S-01 草图。密码被遮盖。昵称没有必填标记。
- 时区不是字段。命令把浏览器的 IANA 名称与其他已输入的值一起发送。
- 结果：`ok` 让人留在这里，没有日历。`registration_rejected`、`send_failed`、`operation_failed` 和 `save_rejected` 留在这里。
- 键盘：Username、Email、Password、Nickname、Register，然后是未登录链接。在字段里按 Enter 激活 Register。
- 追溯：BR-P3、BR-P4、BR-P11。AC-P01、AC-P02、AC-P17、AC-P33、AC-P39。

## S-02 验证

- 行动者与进入：持有验证证明的人。路径 `/verify`。没有会话。流程 F-02。
- 组件：PT-C01，证明的 PT-C03，PT-C02 主要按钮 Verify，安静链接，PT-C09。
- 结果：`ok` 打开 S-04，并且不打开 S-07。不匹配、已用过、未知或找回证明都是 `verification_rejected`，留在这里。
- 键盘：Proof、Verify，然后是未登录链接。
- 追溯：BR-P4。AC-P01。

## S-03 取消注册

- 行动者与进入：没有会话。路径 `/register/cancel`。流程 F-03。
- 组件：PT-C01，邮箱和密码的 PT-C03，PT-C02 主要按钮 Cancel registration，安静链接，PT-C09。
- 页面不画删除已验证账户的控件。
- 结果：`ok` 或 `cancellation_rejected`。未知邮箱、错误密码和已验证账户共用这个拒绝。
- 键盘：Email、Password、Cancel registration，然后是未登录链接。
- 追溯：BR-P4。AC-P24。

## S-04 登录

- 行动者与进入：没有可用会话。路径 `/login`。流程 F-04。
- 组件：PT-C01，邮箱和密码的 PT-C03，PT-C02 主要按钮 Log in，安静链接，PT-C09。
- 结果：`ok` 打开 S-07。`login_rejected` 留在这里，并与 S-05 上该字符串的呈现相同。
- 受保护的进入：没有可用会话时，`/calendar`、`/events/new`、`/events/:id` 和 `/account` 显示本页和 `logged_out`。它们不显示日历，也不显示事件字段。
- 键盘：Email、Password、Log in，然后是未登录链接。
- 追溯：BR-P2、BR-P4。AC-P01、AC-P03、AC-P25、AC-P26、AC-P34。

## S-05 开始找回

- 行动者与进入：一个人。路径 `/recovery`。流程 F-05。
- 组件：PT-C01，邮箱的 PT-C03，PT-C02 主要按钮 Start recovery，安静链接，PT-C09。
- 结果：邮件能发送时是 `login_rejected`，不能发送时是 `send_failed`，或 `operation_failed`。页面不说证明已发出。
- 键盘：Email、Start recovery，然后是未登录链接。
- 追溯：BR-P4。AC-P26、AC-P39。

## S-06 完成找回

- 行动者与进入：持有找回证明的人。路径 `/recovery/complete`。流程 F-05。
- 组件：PT-C01，邮箱、新密码和证明的 PT-C03，PT-C02 主要按钮 Complete recovery，安静链接，PT-C09。
- 页面不发送会话 cookie，也不画在 `ok` 时打开 S-07 的控件。
- 结果：`ok` 打开 S-04，替换密码并结束已打开的会话。它不打开 S-07。`recovery_rejected` 不改变任何东西。
- 键盘：Email、New password、Proof、Complete recovery，然后是未登录链接。
- 追溯：BR-P4。AC-P26。

## S-07 自己的日历

- 行动者与进入：已验证的所有者，在登录之后，或从 S-08、S-09 返回。路径 `/calendar`。流程 F-06 和 F-09。
- 组件：PT-C01，From 和 To 的 PT-C04，PT-C02 主要按钮 Show range，PT-C07 标记，PT-C08 行，`choice_required` 行里的 PT-C06，PT-C02 安静按钮 New event、Account、Event、Series、This occurrence 和 Submit choice，PT-C09。
- 布局：S-07 草图。From 和 To 开始是空的。Q-04 不被一个默认范围关闭。两个日期都存在之前，Show range 不发送。
- 行呈现返回的出现。`scheduled` 显示开始和结束。`skipped` 看起来不像已取消事件，也没有删除控件。`choice_required` 显示返回的两个时刻和返回的公历日。该日期不可编辑。在选中一个返回时刻之前，Submit choice 不发送；发送时带上该时刻和该公历日。
- 非重复行打开 `/events/:id`。系列行可以打开系列编辑，或同一路径的一次出现状态。This occurrence 带上返回的开始时刻。
- 显示名是正文里的名称，包括昵称更改之后，无需再保存一次事件。
- 其他账户和已登出的请求不用这张草图。
- 键盘：From、To、Show range，然后按视觉顺序是各行的内容和动作，然后是 New event 和 Account。
- 追溯：BR-P1、BR-P2、BR-P5、BR-P7、BR-P11。AC-P03、AC-P07、AC-P14、AC-P18、AC-P27、AC-P34、AC-P36、AC-P38。

## S-08 事件

- 行动者与进入：所有者。从 S-07 进入 `/events/new` 或 `/events/:id`。流程 F-07 和 F-08。
- 组件：PT-C01，标题、地点和说明的 PT-C03，开始和结束的 PT-C05，可见性以及创建时重复的 PT-C06，PT-C02 Save，安静的 Cancel、Calendar、Account 和 Series，安静的删除控件，PT-C10，PT-C08 冲突行，PT-C09。创建时，在选中一种重复之前 Save 是安静的，选中后使用主要外观。编辑和一次出现时，Save 是主要按钮。
- 创建发送标题、开始、结束、地点、说明、可见性和一种重复类型。开始和结束是键入的公历日和时钟。私密开始时是选中的。没有重复类型开始时是选中的，在选中一种之前 Save 不发送。不重复选项发送 `none`。空的地点和说明可以发送。
- 编辑显示已存储的值和作为辅助文字的已存储类型。类型不是控件，也不作为变更发送。
- 一次出现的状态是带返回开始时刻的 `/events/:id`。Save 发送分离命令和提交的内容。它不是新路径。
- Cancel，以及 PT-C10 里的 Cancel，都不发送。Delete 只在 PT-C10 之后发送。一次出现使用出现删除命令。事件或系列使用事件删除命令。
- `ok` 留在 S-08，并显示字符串 `ok`。正文包含冲突和 `continuesAfterWindow` 时也显示它们。冲突行显示标题、开始和结束。继续句在这些行之外，不是失败文字。不增加第二句成功说明。Calendar 回到 S-07。
- `save_rejected` 留在这里。月日期被拒绝时显示返回的 `monthTypes` 和 `missingDates`，不显示它们之外的日期。尚未选择的双起点只有在返回正文包含那些时刻时才画出选择。
- 键盘：字段、可见性、存在时的重复、Save、Cancel，然后是存在时的删除控件。在字段里按 Enter 激活 Save。PT-C10 展示后，焦点移到它的 Delete 按钮，然后是它的 Cancel 按钮。
- 追溯：BR-P5、BR-P6、BR-P7、BR-P8、BR-P9、BR-P10、BR-P11。AC-P04、AC-P05、AC-P06、AC-P07、AC-P08、AC-P09、AC-P10、AC-P11、AC-P12、AC-P13、AC-P15、AC-P19、AC-P20、AC-P21、AC-P22、AC-P23、AC-P28、AC-P29、AC-P30、AC-P31、AC-P32、AC-P35、AC-P37、AC-P40。

## S-09 账户

- 行动者与进入：所有者，从 S-07 或 S-08 进入。路径 `/account`。流程 F-04、F-09、F-10 和 F-11。
- 组件：PT-C01，昵称和时区的 PT-C03，两个 PT-C02 主要按钮，安静的 Log out、Calendar 和删除控件，PT-C10，PT-C09。
- 昵称和时区是分开的区域。去掉外层空白后为空的昵称会清除昵称。页面不计算显示名。不画邮箱字段，也不画会话时长控件。
- 退出发送本会话的 `DELETE /api/sessions/current`。已提交的退出画出 S-04，不保留账户字段。
- 删除账户在 PT-C10 之前不发送。已提交的删除画出 S-04，并且不提供部分删除。没有提交的删除留在 S-09。
- 键盘：Nickname、Save nickname、Timezone、Save timezone、Log out、Delete account、Calendar。Enter 激活当前焦点字段所属的主要按钮。PT-C10 的焦点移动与 S-08 相同。
- 追溯：BR-P3、BR-P11、BR-P12。AC-P14、AC-P16、AC-P33、AC-P36、AC-P39。

## 没有自己页面的准则

| 准则 | 在哪里看得见 |
|---|---|
| AC-P35 | S-08 显示它发出的那次保存的正文。 |
| 保存未完成时的 AC-P26 | 那次保存没有写入时，S-08 显示原先的事件。找回本身是 S-05 和 S-06。 |
| AC-L01 至 AC-L13 | 没有页面。后续交付没有目的地。 |
