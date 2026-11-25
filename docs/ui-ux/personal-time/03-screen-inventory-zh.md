# 屏幕清单：个人时间

- 阶段：1 — 信息架构、用户流程和屏幕清单
- 日期：2026-11-25
- 状态：用户于 2026-11-25 随结构基线一并接受本清单。S-01 至 S-09 替换 Stage 0 的候选 C-01 至 C-10。这次接受不是线框或视觉设计，也不授权编写应用代码。
- 不规定布局、颜色、字号或组件尺寸。
- 本文件不替换 `docs/ui-ux/03-screen-inventory.md`。英文文件是规范文本。

## 1. 界面

| ID | 界面 | 行为人 | 进入 | 退出 | 用途 | 页面可以显示的状态 | 追溯 |
|---|---|---|---|---|---|---|---|
| S-01 | 注册 | 没有会话的人 | `/register` | 未验证的注册，并可前往 S-02；或 S-01 不变 | 提交用户名、邮箱、密码、可选昵称和浏览器 IANA 名称 | 就绪、`ok`、`registration_rejected`、`send_failed`、`operation_failed`、`save_rejected` | F-01。AC-P01、AC-P02、AC-P17、AC-P33、AC-P39 |
| S-02 | 验证 | 持有验证证明的人 | `/verify` | 服务器上的账户已验证，然后到 S-04。没有会话 | 提交证明码 | 就绪、`ok`、`verification_rejected` | F-02。AC-P01 |
| S-03 | 取消注册 | 没有会话的人 | `/register/cancel` | 注册消失，或保持不变 | 提交该注册的邮箱和密码 | 就绪、`ok`、`cancellation_rejected` | F-03。AC-P24 |
| S-04 | 登录 | 没有可用会话的人 | `/login` | S-07，或 S-04 不变 | 提交邮箱和密码 | 就绪、`ok`、`login_rejected`、`logged_out` | F-04。AC-P01、AC-P25、AC-P34 |
| S-05 | 开始找回 | 用户 | `/recovery` | 共用的开始结果。不说明证明已发送 | 提交邮箱 | 就绪、`login_rejected`、`send_failed`、`operation_failed` | F-05。AC-P26、AC-P39 |
| S-06 | 完成找回 | 持有找回证明的人 | `/recovery/complete` | `ok` 时打开 S-04，并且不打开 S-07。`recovery_rejected` 时什么都不改变 | 提交邮箱、新密码和证明 | 就绪、`ok`、`recovery_rejected` | F-05。AC-P26 |
| S-07 | 自己的日历 | 当前会话中的已验证所有者 | 登录后的 `/calendar`，或从 S-08、S-09 返回 | S-08、S-09，或 `logged_out` | 显示一段 `from`/`to` 正文、可见性、跳过的日期和需要的选择 | 所有者正文、空范围、`choice_required`、`skipped`、`logged_out`、没有日历和事件 | F-06、F-09。AC-P03、AC-P07、AC-P14、AC-P18、AC-P27、AC-P34、AC-P36、AC-P38 |
| S-08 | 事件 | 所有者 | 从 S-07 进入 `/events/new` 或 `/events/:id` | 从可见的 `ok` 经 Calendar 回到 S-07，或取消后回到 S-07。`ok` 在那次返回之前留在 S-08。保存或删除没有提交时，原来的事件仍在 | 创建或编辑、分离单次出现、删除单次出现，或删除事件 | 未改、编辑中、确认删除、带 `conflicts` 且可选 `continuesAfterWindow` 的 `ok`、可选带预览的 `save_rejected`、`not_found`、`account_gone`、`logged_out` | F-07、F-08。AC-P04 至 AC-P13、AC-P15、AC-P19 至 AC-P23、AC-P28 至 AC-P32、AC-P35、AC-P37、AC-P40 |
| S-09 | 账户 | 所有者 | 从 S-07 或 S-08 进入 `/account` | 昵称或时区有结果后回到 S-07。退出或删除已提交后进入无需会话的页面 | 修改昵称、修改时区、退出、删除账户 | 就绪、昵称已存储或已清除、`save_rejected`、确认删除、已删除、`logged_out` | F-04、F-09、F-10、F-11。AC-P14、AC-P16、AC-P33、AC-P36、AC-P39 |

S-07 的生成选择和 S-08 的单次出现动作是这些界面的状态，不是额外屏幕。

没有可用会话却打开受保护目的地时，S-04 也显示 `logged_out`。该目的地不显示上一份正文里的日历或事件字段。

删除的确认步骤是 S-08 或 S-09 的一种状态。取消不发送请求。

## 2. 每个界面可以发送的命令

| 界面 | 可以发送 | 不得发送 |
|---|---|---|
| S-01 | `POST /api/registrations` | 用户选择的时区、证明、会话 |
| S-02 | 带证明码的 `POST /api/registrations/verify` | 邮箱、密码或会话 |
| S-03 | `POST /api/registrations/cancel` | 会话，或删除已验证账户 |
| S-04 | `POST /api/sessions` | 证明 |
| S-05 | `POST /api/recoveries` | 新密码或证明 |
| S-06 | `POST /api/recoveries/complete` | 会话 cookie。响应不创建会话 |
| S-07 | `GET /api/calendar?from=&to=`，以及带一个返回时刻的 `POST /api/events/:id/choices` | 自行计算的时刻、重叠或预览。搜索、分享、团队或他人日历请求 |
| S-08 | 事件保存、分离、删除单次出现、删除事件 | 重复类型变更。手输双起点的第三个时刻。确认步骤之前的删除 |
| S-09 | `PATCH /api/account`、`PATCH /api/account/timezone`、`DELETE /api/sessions/current`、`DELETE /api/account` | 修改邮箱、会话时长、确认步骤之前的删除 |

## 3. 没有独立界面的验收准则

| 准则 | 行为在哪里可见 | 为什么没有额外屏幕 |
|---|---|---|
| AC-P35 | S-08 显示它发出的那次保存的正文 | 最后提交成功的保存由 API 决定 |
| AC-P26 尚未完成的保存 | 若该保存没有写入，S-08 显示原来的事件 | 完成找回是 F-05。这次竞态不是一个页面 |
| AC-L01 – AC-L13 | 首期没有 | 后续交付。没有目的地 |

## 4. 不在本清单中

| 项目 | 处理 |
|---|---|
| Stage 0 的 C-01 至 C-10 | 由 S-01 至 S-09 替换。已批准的表单仍在。无需会话的表单保持分开。日历、事件和账户按上文归组。 |
| 搜索、他人的公开日历、分享链接、团队、桌面客户端 | 没有界面。 |
| 邮件内容 | 不是屏幕。Q-02 仍开放。 |
| 产品标题 | 未选定。Q-03 仍开放。 |
| 日历的初始范围 | 未选定。Q-04 仍开放。S-07 仍需要明确的范围。 |
| 视觉系统、令牌、线框 | 后续阶段。PT-023 不改。 |

## 5. 从 PRD 流程追溯

| PRD 流程 | 这里的流程 | 屏幕 |
|---|---|---|
| 注册和登录 | F-01、F-02、F-03、F-04、F-05、F-10 | S-01 至 S-06、S-09 |
| 查看自己的可见性 | F-06、F-08 | S-07、S-08 |
| 首期个人日历的私密性 | F-04、F-06 | S-04、S-07 |
| 保存事件 | F-07 | S-08，然后 S-07 |
| 重复和系列编辑 | F-07、F-08 | S-08、S-07 |
| 冲突警告 | F-07 | S-08 |
| 时区 | F-07、F-09 | S-07、S-08、S-09 |
| 删除账户 | F-11 | S-09 |
