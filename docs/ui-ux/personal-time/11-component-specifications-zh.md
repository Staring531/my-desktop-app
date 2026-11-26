# 组件说明：个人时间

- 阶段：3 — 设计令牌与核心组件，用户批准关口 2
- 日期：2026-11-25
- 状态：用户于 2026-11-25 与 `10-design-tokens.md` 一起批准，包括同日的修订：每个命令区域有自己的主要按钮。Stage 6 于 2026-11-25 把这份合同对齐到 `05-visual-design.md` 中已接受的 Agenda 绘制。这次对齐去掉了对 Agenda 基线里不存在的令牌的引用。这次批准不授权应用代码。
- 令牌来源：`tokens/design-tokens.json`
- 屏幕：已接受的清单 S-01 至 S-09。Q-02、Q-03 和 Q-04 仍开放。
- 本文件不替换 `docs/ui-ux/11-component-specifications.md`。那些组件属于另一产品。这里的标识使用 `PT-C` 前缀，以免两套混淆。
- 英文文件是规范文本。
- 本阶段没有做独立的 UI/UX 评审。

共用键盘规则：Tab 按视觉顺序移动。聚焦的按钮由 Enter 和 Space 激活。聚焦的导航链接由 Enter 激活。只有当该确认步骤还没有命令在途时，Escape 才关闭 PT-C10 并且不发送。命令发出之后，在结果返回前，Escape 和取消都不做事。焦点是 `component.button.focus-width` 宽、颜色为 `component.button.focus-color` 的环。每个控件都有可见的文字标签。状态从不只靠颜色。

页面显示 API 的 `result` 和返回字段。它不重新计算时刻、重叠、月预览或证明结果。

## PT-C01 页面

一个任务的浏览器页面。区域：任务标题、当前表面，以及 PT-C09 的位置。任务标题是已接受清单里的表面名称。它不是产品标题。Q-03 仍开放，脚手架标题不作为产品名称显示。

列宽使用 `component.page.content-max`。页边距使用 `component.page.padding-block`、`component.page.padding-inline` 和 `component.page.padding-end`。页面背景是 `component.page.background` 和 `component.page.elevation`。低于 `component.page.stack-below` 时，S-07 的工具行和出现行改成一列。没有导航轨、命令面板、主题控件或浮层。

未登录的表面用安静的导航链接通往其他未登录表面。已登录的表面把日历当作主要任务。账户和事件是回到已接受路径的次要链接。没有可用会话时，受保护路径画出 S-04，并包含 `logged_out`。它不显示日历或事件字段。

## PT-C02 按钮

统一高度 `component.button.height`。变体：

| 变体 | 外观 | 用途 |
|---|---|---|
| 主要 | 强调色填充，白字 | 一个区域里的前进命令：注册、验证、取消注册、登录、开始找回、完成找回、请求日历范围、保存事件、保存昵称或保存时区 |
| 安静 | 底上的主要文字，悬停时加下划线 | 取消、返回、退出、打开事件、打开账户、在未登录页面之间移动，以及尚未选中时刻时的生成选择提交 |

每个命令区域有一个主要按钮。S-01 至 S-06 各有一个区域。S-07 有一个范围区域，每个 `choice_required` 行是自己的区域。S-08 有一个保存区域。S-09 有一个昵称区域和一个时区区域。退出是安静按钮。导航链接使用安静文字的颜色，不是提交。

在选中一个返回时刻之前，该行的提交保持安静并且不发送。选中之后，同一个控件改用主要外观。命令在途时保持原标签，不发送第二次。没有旋转指示，也没有单独的禁用色。结果返回之前，PT-C09 显示 `waiting`。这个词不是 API 结果。

## PT-C03 文字字段

用户名、邮箱、密码、昵称、证明码、标题、地点，以及 S-09 上的 IANA 时区名称，使用单行。密码被遮盖，边框和文字与其他字段相同。说明使用多行，边框和文字相同，高度按正文行高增长。标签在字段外面。

注册不显示时区字段。它在注册命令里发送浏览器给出的 IANA 名称。以后的名称在 S-09 输入。没有修改邮箱的字段。

失败不清空已输入的值。共用失败不把某一个字段的边框改成失败色，因为那会指出是哪个值失败。字段边框保持 `component.field.border`。若有说明，说明在 PT-C09。

## PT-C04 公历日字段

S-07 上的 `from` 和 `to` 是键入的公历日。与生成的选择一起提交的公历日是该返回出现上的日期。它显示为辅助文字，不可编辑。键入的字段使用 PT-C03 的盒子、等宽数字和可见标签。它们不打开月网格，也不选择初始范围。Q-04 仍开放。

## PT-C05 当地时间字段

S-08 上的开始和结束是一起键入并按输入发送的公历日和当地时钟。字段使用 PT-C03 的盒子和等宽数字。它不提供日历，也不把文字换成时刻。没有时钟的日期仍然发送，以便 API 返回 `save_rejected`。缺失的当地时间和尚未选择的双起点以 PT-C09 返回。只有返回正文包含那些时刻时，双起点本身的选择才是 PT-C06。

## PT-C06 选择

带文字标签的单选组。方向键在组内移动。组本身不提交。

| 用途 | 选项 | 初始选中 |
|---|---|---|
| 新事件的可见性 | `private`、`public` | `private` |
| 已有事件的可见性 | 已存储的值，作为选中项显示 | 已存储的值 |
| 创建时的重复 | `non-repeating`、`daily`、`weekly`、`monthly` | 无 |
| S-07 上生成的双起点 | 返回正文里的两个时刻 | 无 |

不重复选项的标签是 `non-repeating`，提交的已存储类型是 `none`。每日、每周和每月提交这些词。创建时，在选中一种重复之前，Save 使用安静外观并且不发送。已有事件上没有重复控件。已存储的类型是辅助文字，不是控件，也不作为变更发送。生成的选择只提供返回的两个时刻。页面不添加第三个。

## PT-C07 事实

S-07 一次出现上的事实列。宽度是 `component.row.facts-size`。词使用 `semantic.font.meta-size`、`component.row.facts-line` 和 `semantic.color.text-meta`。EX-PT-02：没有几何标记。

| 含义 | 词 |
|---|---|
| 公开 | `public` |
| 私密 | `private` |
| 已排定 | `scheduled` |
| 跳过 | `skipped` |
| 需要选择 | `choice_required` |

`scheduled` 还在标题下以辅助文字显示开始和结束。公开和私密是词，不是两种色相。跳过是词 `skipped`，没有删除线，也没有删除控件。每种情况都必须有文字。

## PT-C08 行

出现用一种行，冲突用一种行。出现行把 PT-C07 放在事实列，标题和安静操作在同一行，辅助文字和正文在标题下。内边距使用 `component.row.padding-block` 和 `component.row.padding-inline`。间距使用 `component.row.gap-block` 和 `component.row.gap-inline`。发丝线是 `component.row.rule`，宽度为 `component.field.border-width`（EX-PT-01）。行随标题、地点和说明增高，并保留说明里的换行。这些字符串不被截断。行本身不导航。低于 `component.page.stack-below` 时，工具行和出现行改成一列。标题和安静操作仍在同一行。

出现行显示返回的显示名、可见性、状态、标题、地点和说明。只有状态是 `scheduled` 时才出现开始和结束。跳过的行没有已取消的处理。`choice_required` 的行包含 PT-C06，并且没有已排定的区间。焦点所在的出现使用 `component.row.selected-wash`，以及 `component.row.selected-mark` 色、宽度为 `component.row.selected-mark-width` 的前导条。焦点离开后浅底消失。它不选中时刻，也不改变 Save 或 Delete。

冲突行只显示 `title`、`start` 和 `end`。它没有可见性词，没有浅底，也没有强调条。继续句不是一行。

## PT-C09 结果

发出命令的那个表面上的 `result`。它就地出现。`semantic.motion.feedback` 是 0 毫秒。它是一条提示。它不是吐司，也不是另一个屏幕。

| 正文 | 呈现 |
|---|---|
| `registration_rejected`、`verification_rejected`、`cancellation_rejected`、`login_rejected`、`recovery_rejected`、`send_failed`、`operation_failed`、`save_rejected`、`not_found`、`account_gone` | `result` 字符串，正文大小，颜色为 `semantic.color.text-primary`。同一个字符串在每个表面上看起来相同。字段边框不变。 |
| S-04 和 S-05 上的 `login_rejected` | 同一个组件、同一个字符串。S-05 不说证明已经发出。 |
| `logged_out` | 同样的失败呈现。日历和事件字段不出现。 |
| 带 `monthTypes` 和 `missingDates` 的 `save_rejected` | `result` 字符串，然后是这些返回值的文字。页面不自行添加日期。 |
| 在途 | 词 `waiting`，颜色为 `semantic.color.text-meta`。它不是 API 结果，结果返回后被替换。 |
| 留在原页的 `ok` | 正文中的字符串 `ok`。没有第二句。表面也按正文重绘。 |
| S-02 或 S-06 上的 `ok` | 可见页面变成 S-04。不打开 S-07。 |
| 带 `conflicts` 的 `ok` | 字符串 `ok`，然后每个返回条目使用 PT-C08 冲突行。空列表显示 `ok`，不显示冲突行。 |
| `continuesAfterWindow: true` | 一行 `semantic.color.text-meta`：重复在 90 天之后继续。它在冲突列表之外。 |

失败文字不包含邮箱、密码、证明码、服务商消息或堆栈。它不说明哪个注册字段被占用，也不说明账户是否存在或已验证。

## PT-C10 确认步骤

S-08 或 S-09 上的一块区域，处在页面流中。它使用底色背景、顶部分隔线和 `component.page.text`。它不是对话框，也没有阴影。第一个控件是安静按钮，它展示这块区域并且不发送。展示后的区域写出动作名称，然后是主要按钮 “Delete” 和安静按钮 “Cancel”。收起不发送，屏幕上仍是已存储的账户或事件。在该主要 Delete 被激活之前，不发送删除。若命令没有提交，出现 PT-C09，已存储的记录保持不变。

## 标本

这些标本用于审阅这套系统。它们不是页面布局。

| 标本 | 组成 |
|---|---|
| 主要按钮和安静按钮 | 强调色填充的 “Save” 旁边是安静的 “Cancel” |
| 文字字段 | 标签 “Title”，空白字段表面，字段边框 |
| 公历日字段 | 标签 “From”，等宽数字，没有月网格 |
| 当地时间字段 | 标签 “Start”，等宽数字，没有时钟弹出层 |
| 选择 | `private` 选中，`public` 未选 |
| 重复选择 | 四个词，都未选 |
| 事实 | `public`、`private`、`scheduled`、`skipped` 和 `choice_required` 都是词 |
| 出现行 | 事实列、标题、安静操作，以及返回的显示名 |
| 冲突行 | 只有标题、开始和结束 |
| 共用失败 | `login_rejected`，颜色为 `semantic.color.text-primary`，没有第二句 |
| 继续句 | 辅助文字写明重复在 90 天之后继续，不在冲突列表里 |
| 尚未选择时的选择提交 | 安静文字，并且不发送 |
| 确认步骤 | 动作名称、主要 “Delete”、安静 “Cancel” |

## 追溯

| 组件 | 表面 |
|---|---|
| PT-C01、PT-C02、PT-C09 | S-01 至 S-09，限于该表面可以发送的命令 |
| PT-C03 | S-01 至 S-06、S-08，以及 S-09 上的昵称和时区字段 |
| PT-C04 | S-07 |
| PT-C05，以及可见性和重复的 PT-C06 | S-08 |
| 生成选择的 PT-C06、PT-C07、PT-C08 | S-07。PT-C08 的冲突行也出现在 S-08 |
| PT-C10 | S-08 用于删除事件和一次出现。S-09 用于删除账户 |

S-02、S-03、S-04、S-05 和 S-06 由 PT-C01、PT-C02、PT-C03 和 PT-C09 组成。它们不增加组件。S-05 使用与 S-04 相同的 `login_rejected` 标本。
